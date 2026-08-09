# `@sargonpiraev/prettier-config`

Shared Prettier config for portfolio products and the `packages` monorepo.

## Usage

In product / repo root `package.json`:

```json
{
  "prettier": "@sargonpiraev/prettier-config",
  "scripts": {
    "test:format": "prettier --check ."
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
