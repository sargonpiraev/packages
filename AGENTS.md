# packages

Public npm package monorepo.

- **clients** — transport API clients (OpenAPI → TS when no official SDK)
- **pulumi-*** — thin Pulumi providers over clients
- **mcp-*** — MCP servers over clients
- **eslint-config** — shared project ESLint flat-config + inventory/harness JSON schemas (`@sargonpiraev/eslint-config`)
- **prettier-config** — shared Prettier (`@sargonpiraev/prettier-config`)
- **tsconfig** — shared TypeScript base with `strict: true` (`@sargonpiraev/tsconfig`)

Root `repo.harness.json` + `"prettier": "@sargonpiraev/prettier-config"` + `tsconfig.base.json` extends `@sargonpiraev/tsconfig` are the pilot for hard project harness gates.

Do not put meta-only code here — that belongs in private meta `internal/`.
Projects and jobs depend on published npm versions, not `file:` into private meta (meta may use `file:` while iterating).

## Publish

- CI: [`.github/workflows/on-push-main.yml`](.github/workflows/on-push-main.yml) — baseline checks via `sargonpiraev/ci`, then `multi-semantic-release` on `main`
- Auth: npm Trusted Publishing (OIDC) only — on npmjs.com → package → Settings → Trusted Publisher: GitHub Actions, repo `sargonpiraev/packages`, workflow `on-push-main.yml`
- Opt-in: workspace packages with `.releaserc.json` (released via `multi-semantic-release`)
