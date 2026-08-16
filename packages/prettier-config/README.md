# `@sargonpiraev/prettier-config`

Shared Prettier config for portfolio products and the `packages` monorepo.

Includes **`prettier-plugin-packagejson`** so `package.json` keys are sorted on format/check.

## Usage

At product / repo / meta root — **`prettier.config.mjs`** (not the package.json `"prettier"` key):

```js
export { default } from '@sargonpiraev/prettier-config'
```

```json
{
  "scripts": {
    "test:format": "prettier --check \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "@sargonpiraev/prettier-config": "*",
    "prettier": "^3.7.4"
  }
}
```

Do not commit write-only format scripts as `test:format` — the harness requires `prettier --check`.

## License

MIT © Sargon Piraev
