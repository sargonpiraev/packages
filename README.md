# packages

Public npm monorepo (Turborepo): API clients, Pulumi providers, MCP servers.

Sibling checkout under the private meta workspace (`projects/packages`). Meta-only libraries live in meta `internal/`, not here.

## Layout

```text
packages/
  habitify-api-client/
  hh-api-client/
  *-mcp-server/     # MCP servers
  pulumi-*          # Pulumi providers (GSC, Telegram, Expo, …)
  <api>-client/     # transport clients (often OpenAPI-generated)
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

Publish is opt-in per package (`.releaserc.json` + `multi-semantic-release` on `main`). npm Trusted Publishing (OIDC) — no `NPM_TOKEN`.

## Develop

```bash
npm install
npm run generate   # hh-api-client OpenAPI → src/generated
npm run build
npm run lint
npm run check-types
npm test
```
