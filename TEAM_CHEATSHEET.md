# Team Daily Cheatsheet (1 Screen)

## 1) Начать новую задачу
1. `npm run session:menu`
2. `Start Session`
3. Выбрать тип ветки: `feat|fix|content|refactor|chore|docs|hotfix`
4. Указать короткое имя ветки
5. `npm run dev`

## 2) В процессе работы подтянуть свежий main
1. `npm run session:menu`
2. `Sync Current Branch`

## 3) Передать текущий прогресс коллеге (handoff)
1. `npm run session:menu`
2. `Handoff Current Branch`
3. Ввести commit message (WIP) и note
4. Отправить коллеге:
- `branch`
- `branch_url`
- `pr_url`
- `note`

## 4) Завершить задачу и открыть PR
1. `npm run session:menu`
2. `Finish Session`
3. Дождаться `npm run build`
4. Подтвердить commit/push
5. Открыть PR по ссылке из вывода

## 5) Слить ветку в main
1. `npm run session:menu`
2. `Merge Current Branch To Main`
3. Подтвердить merge (`y`)

## 6) Быстрый статус репозитория
- `npm run session:status`

## 7) Прод-деплой на Vercel
- `npm run deploy:prod`
- Production URL: `https://reflow-landing-iota.vercel.app`

## 8) Перед переводом репо в public
1. Проверить, что `.env*` не в git
2. Проверить отсутствие токенов/секретов в tracked файлах
3. Секреты хранить только в Vercel Environment Variables

