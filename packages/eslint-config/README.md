# `@sargonpiraev/eslint-config`

Shared ESLint flat-config presets + JSON schemas for project inventory / harness gates:

| Gate | Files |
|---|---|
| Nx / scripts | `project.json`, `package.json` (`test:*`, `build`, `prettier`, `test:format` = `prettier --check`) |
| Worktrees | `.cursor/worktrees.json` |
| Workflow / release | `.github/workflows/on-push-main.yml` (calls `sargonpiraev/ci`; no `NPM_TOKEN`) |
| Playwright | `apps/*/playwright.harness.json` |
| Repo / apps | `repo.harness.json` + disk `apps/*` allowlist |
| Prettier | `package.json#prettier` → `@sargonpiraev/prettier-config` |
| TypeScript | root `tsconfig.json` / `tsconfig.base.json` extends `@sargonpiraev/tsconfig` |
| Env | Prefer `apps/<app>/src/env.ts` (Zod SSOT) + generated `.env.example`; transitional `env.harness.json` when env.ts missing |
| Pulumi | if `pulumi/` exists: `Pulumi.yaml`, TS entry, `pulumi:preview` / `pulumi:up` |
| semantic-release | `.releaserc.json` shape when present |

Meta-only gates (`meta__package`, meta lefthook, commitlint shape) stay in the private meta repo.

## Install

```bash
npm install -D @sargonpiraev/eslint-config eslint eslint-plugin-json-schema-validator
npm install -D @sargonpiraev/prettier-config @sargonpiraev/tsconfig prettier
```

## Project usage

`eslint.config.mjs` at the project root:

```js
import project from '@sargonpiraev/eslint-config/project'

export default [...project]
```

Wire into `test:lint` (example):

```bash
eslint --config ./eslint.config.mjs --no-config-lookup --no-warn-ignored --no-error-on-unmatched-pattern \
  "project.json" "package.json" ".cursor/worktrees.json" \
  "repo.harness.json" "env.harness.json" "pulumi.harness.json" \
  "tsconfig.json" "tsconfig.base.json" ".releaserc.json" \
  ".github/workflows/on-push-main.yml" \
  "playwright.harness.json" "apps/*/playwright.harness.json"
```

### Opt-in harness files

```json
// repo.harness.json (required)
{ "layout": "turbo", "apps": ["webapp", "wuiapp"] }
```

```ts
// apps/webapp/src/env.ts — preferred SSOT
export const serverSchema = { DATABASE_URL: z.string().describe('…') }
```

```json
// env.harness.json — transitional if env.ts not yet adopted
{ "requiredKeys": { "webapp": ["DATABASE_URL"] } }
```

```json
// pulumi.harness.json (optional; only if pulumi/ exists)
{ "entry": "index.ts" }
```

## Meta usage

```js
import projectMeta from '@sargonpiraev/eslint-config/project-meta'

export default [
  { ignores: ['pulumi/**', '**/node_modules/**'] },
  ...projectMeta,
  // meta__package, meta lefthook, commitlint, …
]
```

## What fails

| Failure | Meaning |
|---|---|
| missing `prettier` / not `@sargonpiraev/prettier-config` | adopt shared Prettier package |
| `test:format` without `prettier --check` | noops / `--write`-only rejected |
| missing root tsconfig extending `@sargonpiraev/tsconfig` | adopt shared TS base (`strict: true`) |
| missing / mismatched `repo.harness.json` | declare canonical `apps/*`; legacy `web`/`docs`/`mobile`/etc. forbidden |
| flat-root Next (`next` dep, no `apps/`) | must be turbo monorepo with `apps/webapp` |
| env apps without `env.ts` / `env.harness.json` / `.env.example` | Zod SSOT preferred; harness names-only transitional |
| `pulumi/` without yaml/entry/scripts | add `Pulumi.yaml`, TS entry, `pulumi:preview`/`pulumi:up` |
| `NPM_TOKEN` in workflow | use Trusted Publishing OIDC + `id-token: write` |

## Schemas (IDE `$schema`)

```text
@sargonpiraev/eslint-config/schemas/project__project.json
@sargonpiraev/eslint-config/schemas/project__package.json
@sargonpiraev/eslint-config/schemas/project__repo-harness.json
@sargonpiraev/eslint-config/schemas/project__env-harness.json
@sargonpiraev/eslint-config/schemas/project__pulumi-harness.json
@sargonpiraev/eslint-config/schemas/project__tsconfig.json
@sargonpiraev/eslint-config/schemas/project__releaserc.json
@sargonpiraev/eslint-config/schemas/project__worktrees.json
@sargonpiraev/eslint-config/schemas/project__workflow-on-push-main.json
@sargonpiraev/eslint-config/schemas/app__playwright-webapp.json
@sargonpiraev/eslint-config/schemas/app__playwright-extapp.json
```

## License

MIT © Sargon Piraev
