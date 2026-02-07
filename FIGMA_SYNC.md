# Figma Asset Sync

## 1) Set token

```bash
export FIGMA_TOKEN=your_figma_personal_access_token
```

Scopes for the token:

- required: `file_content:read`
- optional (faster change detection): `file_versions:read`

## 2) Configure assets

Edit `/Users/admin/cursor/pencil-test/figma-assets.json`:

- `fileKey`: your Figma file key
- For each asset:
  - `nodeId` (or `nodeUrl`)
  - optional mobile override: `nodeIdMobile` (or `nodeUrlMobile`)
  - `format`: `svg`, `png`, `jpg`, `pdf`
  - `output`: target file path inside this repo
  - `slot`: UI placeholder key used by the app
  - when `nodeIdMobile/nodeUrlMobile` is set, mobile file path is auto-derived from `output`:
    - `public/figma/hero.png` -> `public/figma/hero.mobile.png`
    - `public/figma/icons/logo.svg` -> `public/figma/icons/logo.mobile.svg`
    - corresponding manifest slot is auto-generated as `${slot}Mobile`
  - if mobile override is not set, `${slot}Mobile` is auto-fallbacked to desktop `${slot}` (same `src` in manifest)

## 3) Sync assets

```bash
npm run figma:sync
```

This command:

- downloads assets from Figma into `public/figma/...`
- updates `/Users/admin/cursor/pencil-test/src/app/generated/figma-assets-manifest.json`

UI placeholders and icons read this manifest automatically.

## Auto-sync while dev is running

Run dev server + tunnel + Figma watcher:

```bash
npm run dev:figma
```

Behavior:

- waits until local app is ready
- starts tunnel
- starts `figma:watch`
- polls Figma every `8s` by default for nodes listed in `figma-assets.json`
- downloads only assets that changed, and skips file writes if content is byte-identical
- logs detected changes and per-asset progress in terminal

You can override watch interval:

```bash
FIGMA_WATCH_INTERVAL_SECONDS=10 npm run dev:figma
```

Watch only selected assets (comma-separated filters):

```bash
FIGMA_WATCH_SLOTS=imageHeroPreview,imagePlatformsPreview npm run dev:figma
```

```bash
FIGMA_WATCH_NODE_IDS=10299:1570,10299:1575 npm run dev:figma
```

```bash
FIGMA_WATCH_OUTPUTS=public/figma/hero-preview.png npm run dev:figma
```

You can also disable watch per asset directly in `figma-assets.json`:

```json
{ "slot": "iconClose", "watch": false, "...": "..." }
```

Or run watcher separately:

```bash
npm run figma:watch
```

## Notes

- SVG icons are synced the same way as raster images.
- If a slot is not synced yet, UI uses built-in fallback graphics, so layout does not break.
- Warning `Version check disabled (missing file_versions:read)` means the token has only `file_content:read`. Sync still works via URL-diff mode, but with one extra API check on each interval.
