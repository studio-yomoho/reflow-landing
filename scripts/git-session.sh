#!/usr/bin/env bash

set -euo pipefail

REMOTE_NAME="${REMOTE_NAME:-origin}"

print_help() {
  cat <<'EOF'
Git session helper for collaborative flow.

Usage:
  bash ./scripts/git-session.sh menu
  bash ./scripts/git-session.sh start [type] [name]
  bash ./scripts/git-session.sh sync
  bash ./scripts/git-session.sh finish
  bash ./scripts/git-session.sh handoff
  bash ./scripts/git-session.sh merge

Commands:
  menu    Interactive menu (start/sync/finish/handoff/merge/status)
  start   Sync main and create/switch feature branch
  sync    Rebase current branch on top of origin/main
  finish  Build, optional commit, push branch, print PR URL
  handoff Save WIP progress, push current branch, print handoff summary
  merge   Directly merge current branch into main and push
EOF
}

require_git_repo() {
  git rev-parse --is-inside-work-tree >/dev/null
}

prepare_worktree_for_start() {
  if [[ -z "$(git status --porcelain)" ]]; then
    return
  fi

  echo "[session] Working tree is not clean."
  echo "[session] Current local changes:"
  echo "[session] > git status --short"
  git status --short
  echo ""
  echo "[session] > git --no-pager diff"
  git --no-pager diff || true
  echo ""

  while true; do
    echo "[session] Choose how to handle local changes before Start Session:"
    echo "[session] 1) Commit and continue  - сохранить изменения в текущей ветке (git commit)"
    echo "[session] 2) Stash and continue   - временно убрать изменения в stash (потом можно вернуть)"
    echo "[session] 3) Discard local changes - полностью удалить локальные изменения и untracked файлы"
    echo "[session] 4) Cancel               - ничего не менять и выйти из Start Session"
    select action in \
      "Commit and continue (save now)" \
      "Stash and continue (save for later)" \
      "Discard local changes (delete local edits)" \
      "Cancel (exit without changes)"; do
      case "${REPLY}" in
        1)
          git add -A
          local commit_message
          read -r -p "[session] Commit message: " commit_message
          if [[ -z "${commit_message}" ]]; then
            commit_message="wip: preserve local changes before start session"
          fi
          git commit -m "${commit_message}"
          return
          ;;
        2)
          local stash_message
          read -r -p "[session] Stash message (default: wip-before-start-session): " stash_message
          if [[ -z "${stash_message}" ]]; then
            stash_message="wip-before-start-session"
          fi
          git stash push -u -m "${stash_message}"
          return
          ;;
        3)
          echo "[session] This will discard ALL local changes, including untracked files."
          read -r -p "[session] Type DISCARD to confirm: " confirm_discard
          if [[ "${confirm_discard}" == "DISCARD" ]]; then
            git reset --hard HEAD
            git clean -fd
            return
          fi
          echo "[session] Discard cancelled."
          break
          ;;
        4)
          echo "[session] Start Session cancelled."
          exit 1
          ;;
        *)
          echo "[session] Invalid option."
          ;;
      esac
    done
  done
}

slugify() {
  local raw="$1"
  echo "${raw}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g'
}

remote_https_base() {
  local remote_url
  remote_url="$(git remote get-url "${REMOTE_NAME}")"

  if [[ "${remote_url}" =~ ^git@github.com:(.+)\.git$ ]]; then
    echo "https://github.com/${BASH_REMATCH[1]}"
    return
  fi

  if [[ "${remote_url}" =~ ^https://github.com/(.+)\.git$ ]]; then
    echo "https://github.com/${BASH_REMATCH[1]}"
    return
  fi

  echo "${remote_url}"
}

pick_branch_type() {
  local selected=""
  local options=("feat" "fix" "content" "refactor" "chore" "docs" "hotfix")
  echo "[session] Select branch type:" >&2
  select opt in "${options[@]}"; do
    if [[ -n "${opt:-}" ]]; then
      selected="${opt}"
      break
    fi
    echo "[session] Invalid option." >&2
  done
  echo "${selected}"
}

start_session() {
  local branch_type="${1:-}"
  local branch_name="${2:-}"

  prepare_worktree_for_start

  echo "[session] Fetching ${REMOTE_NAME}..."
  git fetch "${REMOTE_NAME}" --prune

  echo "[session] Updating main..."
  git switch main
  git pull --ff-only "${REMOTE_NAME}" main

  if [[ -z "${branch_type}" ]]; then
    branch_type="$(pick_branch_type | tr -d '[:space:]')"
  fi

  if [[ -z "${branch_name}" ]]; then
    read -r -p "[session] Branch short name (e.g. pricing-alignment): " branch_name
  fi

  branch_name="$(slugify "${branch_name}")"
  if [[ -z "${branch_name}" ]]; then
    echo "[session] Empty branch name."
    exit 1
  fi

  local target_branch="${branch_type}/${branch_name}"
  if git show-ref --verify --quiet "refs/heads/${target_branch}"; then
    git switch "${target_branch}"
  else
    git switch -c "${target_branch}"
  fi

  echo "[session] Active branch: ${target_branch}"
  echo "[session] Start work with: npm run dev"
}

sync_session() {
  local current_branch
  current_branch="$(git branch --show-current)"
  echo "[session] Current branch: ${current_branch}"

  echo "[session] Fetching ${REMOTE_NAME}..."
  git fetch "${REMOTE_NAME}" --prune

  if [[ "${current_branch}" == "main" ]]; then
    git pull --ff-only "${REMOTE_NAME}" main
    echo "[session] main updated."
    return
  fi

  echo "[session] Rebasing ${current_branch} onto ${REMOTE_NAME}/main..."
  git rebase "${REMOTE_NAME}/main"
  echo "[session] Rebase complete."
}

finish_session() {
  local current_branch
  current_branch="$(git branch --show-current)"
  if [[ "${current_branch}" == "main" ]]; then
    echo "[session] Refusing to finish from main. Use a feature branch."
    exit 1
  fi

  echo "[session] Running build check..."
  npm run build

  if [[ -n "$(git status --porcelain)" ]]; then
    read -r -p "[session] Commit current changes? [y/N]: " do_commit
    if [[ "${do_commit:-}" =~ ^[Yy]$ ]]; then
      git add -A
      read -r -p "[session] Commit message: " commit_message
      if [[ -z "${commit_message}" ]]; then
        commit_message="chore: update ${current_branch}"
      fi
      git commit -m "${commit_message}"
    fi
  fi

  echo "[session] Pushing ${current_branch}..."
  git push -u "${REMOTE_NAME}" "${current_branch}"

  local base_url
  base_url="$(remote_https_base)"
  if [[ "${base_url}" == https://github.com/* ]]; then
    echo "[session] PR URL:"
    echo "${base_url}/compare/main...${current_branch}?expand=1"
  else
    echo "[session] Branch pushed. Open a PR in your Git provider."
  fi
}

handoff_session() {
  local current_branch
  current_branch="$(git branch --show-current)"
  if [[ "${current_branch}" == "main" ]]; then
    echo "[session] Handoff from main is blocked. Switch to a work branch first."
    exit 1
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    read -r -p "[session] Include all current changes in handoff commit? [Y/n]: " include_changes
    if [[ ! "${include_changes:-Y}" =~ ^[Nn]$ ]]; then
      git add -A
      local commit_message
      read -r -p "[session] Commit message (default: wip: handoff ${current_branch}): " commit_message
      if [[ -z "${commit_message}" ]]; then
        commit_message="wip: handoff ${current_branch}"
      fi
      git commit -m "${commit_message}"
    else
      echo "[session] Skipping commit."
    fi
  else
    echo "[session] No local changes to commit."
  fi

  echo "[session] Pushing ${current_branch}..."
  git push -u "${REMOTE_NAME}" "${current_branch}"

  local base_url branch_url compare_url
  base_url="$(remote_https_base)"
  if [[ "${base_url}" == https://github.com/* ]]; then
    branch_url="${base_url}/tree/${current_branch}"
    compare_url="${base_url}/compare/main...${current_branch}?expand=1"
  else
    branch_url="${REMOTE_NAME}:${current_branch}"
    compare_url="(not available for this remote)"
  fi

  local handoff_note
  read -r -p "[session] Handoff note (optional, one line): " handoff_note

  echo ""
  echo "[session] Handoff package:"
  echo "branch: ${current_branch}"
  echo "branch_url: ${branch_url}"
  echo "pr_url: ${compare_url}"
  if [[ -n "${handoff_note}" ]]; then
    echo "note: ${handoff_note}"
  fi
  echo ""
  echo "[session] Share this with teammate:"
  echo "1) branch: ${current_branch}"
  echo "2) open: ${branch_url}"
  echo "3) create PR: ${compare_url}"
  if [[ -n "${handoff_note}" ]]; then
    echo "4) note: ${handoff_note}"
  fi
}

merge_session() {
  local current_branch
  current_branch="$(git branch --show-current)"
  if [[ "${current_branch}" == "main" ]]; then
    echo "[session] Already on main. Switch to a feature branch first."
    exit 1
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "[session] Working tree is not clean. Commit/stash changes first."
    exit 1
  fi

  echo "[session] This will merge '${current_branch}' into 'main' and push to ${REMOTE_NAME}."
  read -r -p "[session] Continue? [y/N]: " confirm
  if [[ ! "${confirm:-}" =~ ^[Yy]$ ]]; then
    echo "[session] Merge cancelled."
    return
  fi

  echo "[session] Fetching ${REMOTE_NAME}..."
  git fetch "${REMOTE_NAME}" --prune

  echo "[session] Updating main..."
  git switch main
  git pull --ff-only "${REMOTE_NAME}" main

  echo "[session] Merging ${current_branch} into main..."
  git merge --no-ff "${current_branch}"

  echo "[session] Pushing main..."
  git push "${REMOTE_NAME}" main

  echo "[session] Merge complete."
}

show_status() {
  echo "[session] Repo: $(basename "$(pwd)")"
  echo "[session] Branch: $(git branch --show-current)"
  echo "[session] Remotes:"
  git remote -v
  echo "[session] Working tree:"
  git status --short
}

menu() {
  while true; do
    echo ""
    echo "[session] Choose action:"
    select action in "Start Session" "Sync Current Branch" "Finish Session" "Handoff Current Branch" "Merge Current Branch To Main" "Status" "Exit"; do
      case "${REPLY}" in
        1)
          start_session
          break
          ;;
        2)
          sync_session
          break
          ;;
        3)
          finish_session
          break
          ;;
        4)
          handoff_session
          break
          ;;
        5)
          merge_session
          break
          ;;
        6)
          show_status
          break
          ;;
        7)
          return
          ;;
        *)
          echo "[session] Invalid option."
          ;;
      esac
    done
  done
}

main() {
  require_git_repo
  local cmd="${1:-menu}"
  case "${cmd}" in
    menu)
      menu
      ;;
    start)
      start_session "${2:-}" "${3:-}"
      ;;
    sync)
      sync_session
      ;;
    finish)
      finish_session
      ;;
    handoff)
      handoff_session
      ;;
    merge)
      merge_session
      ;;
    status)
      show_status
      ;;
    help|-h|--help)
      print_help
      ;;
    *)
      echo "[session] Unknown command: ${cmd}"
      print_help
      exit 1
      ;;
  esac
}

main "$@"
