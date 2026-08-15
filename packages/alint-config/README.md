# `@sargonpiraev/alint-config`

Shareable [alint](https://alint.org) rules for **product project roots** (FS structure / presence).

Lint root is the **current repo** — not the meta polyrepo sibling inventory.

## What it checks

| Rule id | When | Requires |
| --- | --- | --- |
| `project` | `package.json` at root | `AGENTS.md`, `lefthook.yml`, `package.json`, `package-lock.json`, `project.json`, `.alint.yml` |
| `turborepo` | `turbo.json` at root | `turbo.json`, `apps/`, `packages/` |

## Usage

In the product / shared monorepo root `.alint.yml`:

```yaml
# yaml-language-server: $schema=https://alint.org/_alint/configuration/schema.json
version: 1

extends:
  - ./node_modules/@sargonpiraev/alint-config/project.yml
```

Install:

```json
{
  "scripts": {
    "test:alint": "alint check"
  },
  "devDependencies": {
    "@asamarts/alint": "^0.14.2",
    "@sargonpiraev/alint-config": "*"
  }
}
```

Inside this monorepo (before publish), extend the workspace file directly:

```yaml
extends:
  - ./packages/alint-config/project.yml
```

## Meta vs product

- **Meta** (`projects/`): keeps clone inventory + fan-out in `.alint/projects.yml`.
- **Products / shared**: extend this package and run `alint check` at the project root.

## License

MIT © Sargon Piraev
