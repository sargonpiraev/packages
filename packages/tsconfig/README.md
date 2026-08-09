# `@sargonpiraev/tsconfig`

Shared TypeScript base configs. `base.json` sets `strict: true`.

## Usage

Product / monorepo root `tsconfig.json` or `tsconfig.base.json`:

```json
{
  "extends": "@sargonpiraev/tsconfig/base.json"
}
```

App packages may extend the repo base and override `module` / `jsx` as needed. Do not set `"strict": false`.

Wire `test:check-types` in root `package.json` (already required by `@sargonpiraev/eslint-config` product schemas).

## License

MIT © Sargon Piraev
