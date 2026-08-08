# packages

Public npm monorepo (Turborepo): API clients, Pulumi providers, MCP servers.

Sibling checkout under the private meta workspace (`projects/packages`). Meta-only libraries live in meta `internal/`, not here.

## Layout

```text
packages/
  <api>-client/     # transport clients (often OpenAPI-generated)
  pulumi-<api>/     # Pulumi providers (depend on *-client)
  mcp-<api>/        # MCP servers (depend on *-client)
```

Publish is opt-in per package via CI / `semantic-release` when a package is ready.

## Develop

```bash
npm install
npm run build
npm run lint
npm run check-types
npm test
```
