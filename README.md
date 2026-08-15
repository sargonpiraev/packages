# shared

Public shared monorepo (Turborepo): npm packages, reusable GitHub Actions, and Lefthook remotes baseline.

Sibling checkout under the private meta workspace (`projects/shared`). Merged from former `packages` + `ci` clones. Meta-only libraries live in meta `internal/`, not here.

## Layout

```text
shared/
  packages/           # npm workspaces (@sargonpiraev/*)
  ci/lefthook.yml     # Lefthook provider (other repos remotes: this file)
  .github/workflows/  # Reusable GH Actions (must be repo-root .github/)
  .github/actions/    # Composite actions
  repo-on-push-main   # This repo’s consumer workflow + npm release
```

### Packages

| Package | Kind |
|---|---|
| `@sargonpiraev/habitify-api-client` | API client |
| `@sargonpiraev/hh-api-client` | API client |
| `@sargonpiraev/habitify-mcp-server` | MCP |
| `@sargonpiraev/hh-mcp-server` | MCP |
| `@sargonpiraev/jira-mcp-server` | MCP |
| `@sargonpiraev/github-mcp-server` | MCP |
| `@sargonpiraev/confluence-mcp-server` | MCP |
| `@sargonpiraev/gitlab-mcp-server` | MCP |
| `@sargonpiraev/slack-mcp-server` | MCP |
| `@sargonpiraev/notion-mcp-server` | MCP |
| `@sargonpiraev/google-tasks-mcp-server` | MCP |
| `@sargonpiraev/google-calendar-mcp-server` | MCP |
| `@sargonpiraev/pulumi-gsc` | Pulumi provider |
| `@sargonpiraev/pulumi-telegram` | Pulumi provider |
| `@sargonpiraev/pulumi-expo` | Pulumi provider |
| `@sargonpiraev/eslint-config` | ESLint + project schemas |
| `@sargonpiraev/prettier-config` | Prettier |
| `@sargonpiraev/tsconfig` | TypeScript base |

Publish is opt-in per package (`.releaserc.json` + `multi-semantic-release` on `main`). npm Trusted Publishing (OIDC) — no `NPM_TOKEN`.

## CI / Lefthook

See [`ci/README.md`](ci/README.md). Until GitHub rename `packages` → `shared` and archive of `ci`, external `uses:` / lefthook remotes may still point at `sargonpiraev/ci`.

## Develop

```bash
npm install
npm run generate   # hh-api-client OpenAPI → src/generated
npm run build
npm run lint
npm run check-types
npm test
```
