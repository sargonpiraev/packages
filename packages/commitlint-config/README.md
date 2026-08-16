# `@sargonpiraev/commitlint-config`

Shared Commitlint config for portfolio products and the `packages` monorepo.

Extends `@commitlint/config-conventional`.

## Usage

At product / repo / meta root — **`commitlint.config.cjs`**:

```js
module.exports = {
  extends: ['@sargonpiraev/commitlint-config'],
}
```

```json
{
  "devDependencies": {
    "@commitlint/cli": "^21.2.1",
    "@sargonpiraev/commitlint-config": "*"
  }
}
```

Do not extend `@commitlint/config-conventional` directly at the repo root — use this package so portfolio defaults stay in one place.

## License

MIT © Sargon Piraev
