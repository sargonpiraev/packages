# packages

Public npm package monorepo.

- **clients** — transport API clients (OpenAPI → TS when no official SDK)
- **pulumi-*** — thin Pulumi providers over clients
- **mcp-*** — MCP servers over clients

Do not put meta-only code here — that belongs in private meta `internal/`.
Products and jobs depend on published npm versions, not `file:` into private meta.
