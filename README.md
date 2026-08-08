# packages

Public npm monorepo (Turborepo): API clients, Pulumi providers, MCP servers.

Sibling checkout under the private meta workspace (`projects/packages`). Meta-only libraries live in meta `internal/`, not here.

## Layout

```text
packages/
  habitify-api-client/
  hh-api-client/
  <api>-client/     # transport clients (often OpenAPI-generated)
  pulumi-<api>/     # Pulumi providers (depend on *-client)
  mcp-<api>/        # MCP servers (depend on *-client)
```

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
