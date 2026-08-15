# CI baseline (former `sargonpiraev/ci`)

Reusable GitHub Actions and the Lefthook remotes provider live in this monorepo (`sargonpiraev/shared`) after the `packages` + `ci` merge.

| Path | Role |
|---|---|
| [`lefthook.yml`](./lefthook.yml) | Provider hooks baseline — other repos pull via lefthook `remotes:` |
| [`alint/project.yml`](./alint/project.yml) | Product-root alint FS gates — extend via local path or HTTPS+SRI |
| [`../.github/workflows/`](../.github/workflows/) | Reusable workflows (`on-push-main.yml`, …) — must stay at repo-root `.github/` for GitHub Actions |
| [`../.github/actions/`](../.github/actions/) | Composite actions (e.g. `setup-node-npm-ci`) |

Consumers point remotes / `uses:` at `sargonpiraev/shared` (lefthook config path: `ci/lefthook.yml`).

Product `.alint.yml` can extend `ci/alint/project.yml` locally (`./ci/alint/project.yml` inside this repo, or `../shared/ci/alint/project.yml` from a sibling clone). Remote HTTPS requires an SRI fragment (`#sha256-…`); pin with `shasum -a 256 ci/alint/project.yml` after the file lands on `main`.
