# shared

Shared monorepo (former `packages` + `ci`).

- **clients** — transport API clients (OpenAPI → TS when no official SDK)
- **pulumi-*** — thin Pulumi providers over clients
- **mcp-*** — MCP servers over clients
- **eslint-config** — shared project ESLint flat-config + inventory/harness JSON schemas (`@sargonpiraev/eslint-config`)
- **prettier-config** — shared Prettier (`@sargonpiraev/prettier-config`)
- **tsconfig** — shared TypeScript base with `strict: true` (`@sargonpiraev/tsconfig`)
- **ci/** — Lefthook remotes provider baseline (`ci/lefthook.yml`)
- **.github/** — reusable GitHub Actions workflows + composite actions (from former `sargonpiraev/ci`)

Root `repo.harness.json` + `"prettier": "@sargonpiraev/prettier-config"` + `tsconfig.base.json` extends `@sargonpiraev/tsconfig` are the pilot for hard project harness gates.

Do not put meta-only code here — that belongs in private meta `internal/`.
Projects and jobs depend on published npm versions, not `file:` into private meta (meta may use `file:` while iterating).

## Publish

- CI: [`.github/workflows/repo-on-push-main.yml`](.github/workflows/repo-on-push-main.yml) — baseline checks via local reusable [`.github/workflows/on-push-main.yml`](.github/workflows/on-push-main.yml), then `multi-semantic-release` on `main`
- Auth: npm Trusted Publishing (OIDC) only — on npmjs.com → package → Settings → Trusted Publisher: GitHub Actions, repo (currently `sargonpiraev/packages` until rename to `shared`), workflow `repo-on-push-main.yml`
- Opt-in: workspace packages with `.releaserc.json` (released via `multi-semantic-release`)
