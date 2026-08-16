# `@sargonpiraev/semantic-release-config`

Shared semantic-release base for portfolio packages and products.

Default: `main` only; plugins = commit-analyzer → release-notes-generator → npm → github (PR/issue comments and released labels off).

## Usage

Thin `.releaserc.json` (do not duplicate the plugin list):

```json
{
  "extends": "@sargonpiraev/semantic-release-config"
}
```

Local overlays (e.g. `pkgRoot`, `npmPublish: false`) may set `plugins` / other keys — they **replace** extended array options, they do not deep-merge.

Install where you run `semantic-release` / `multi-semantic-release`:

```json
{
  "devDependencies": {
    "@sargonpiraev/semantic-release-config": "*"
  }
}
```

This package’s own `.releaserc.json` extends `./index.js` (chicken-egg safe before first publish).

Trusted Publisher workflow filename for this monorepo: `repo-on-push-main.yml`.

## License

MIT © Sargon Piraev
