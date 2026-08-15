# CI baseline (former `sargonpiraev/ci`)

Reusable GitHub Actions and the Lefthook remotes provider live in this monorepo after the `packages` + `ci` merge.

| Path | Role |
|---|---|
| [`lefthook.yml`](./lefthook.yml) | Provider hooks baseline — other repos pull via lefthook `remotes:` |
| [`../.github/workflows/`](../.github/workflows/) | Reusable workflows (`on-push-main.yml`, …) — must stay at repo-root `.github/` for GitHub Actions |
| [`../.github/actions/`](../.github/actions/) | Composite actions (e.g. `setup-node-npm-ci`) |

Until the GitHub repo is renamed `packages` → `shared` and `ci` is archived, external consumers may still reference `sargonpiraev/ci`. After rename, point remotes / `uses:` at `sargonpiraev/shared` (lefthook config path: `ci/lefthook.yml`).
