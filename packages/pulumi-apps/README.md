# @sargonpiraev/pulumi-apps

Pulumi **ComponentResources** for Turborepo app types + resource-triggered warehouse ETL helpers.

One package, multiple modules — not one npm package per app type.

## Exports

| Export | Type token | Role |
| --- | --- | --- |
| `Webapp` | `sargonpiraev:apps:Webapp` | GSC property + BQ bulk-export dataset/IAM; optional GA4 property + BigQuery link via `@sargonpiraev/pulumi-ga4`. **No** custom CF (native GSC/GA→BQ). |
| `Extapp` | `sargonpiraev:apps:Extapp` | CWS listing → BQ `product_cws` + Gen1 CF + Scheduler |
| `Mobapp` | `sargonpiraev:apps:Mobapp` | ASC → BQ `product_appstore` + Gen1 CF + Scheduler (Play later) |
| `NpmDownloadsEtl` | `sargonpiraev:apps:NpmDownloadsEtl` | npm downloads → `product_npm` |
| `VercelFinopsEtl` | `sargonpiraev:apps:VercelFinopsEtl` | Vercel FOCUS → `finops` |
| `NeonFinopsEtl` | `sargonpiraev:apps:NeonFinopsEtl` | Neon consumption → `finops` |

Also: `repoHasWebapp` / `repoHasExtapp` / `repoHasMobapp` / `repoHasApp`, and the `*_TYPE` constants for `test:pulumi`.

Subpath imports: `@sargonpiraev/pulumi-apps/webapp`, `/extapp`, `/mobapp`, `/finops`.

## Install

```bash
npm install @sargonpiraev/pulumi-apps
```

## Project usage

```ts
import {
  Webapp,
  WEBAPP_TYPE,
  Extapp,
  EXTAPP_TYPE,
  Mobapp,
  MOBAPP_TYPE,
} from "@sargonpiraev/pulumi-apps";
import * as pulumi from "@pulumi/pulumi";

// webapp — native GSC/GA→BQ only
new Webapp("webapp", { /* … */ });

// extapp — pass CF source from meta dwhapp (or project copy)
new Extapp("extapp", {
  gcpProjectId: "sargonpiraev",
  location: "EU",
  region: "europe-west1",
  datasetId: "product_cws",
  cwsItemId: "…",
  cwsItemSlug: "modreq",
  productLabel: "modreq",
  loaderAccountId: "cws-etl-runner",
  gcpServiceAccountKeyB64: process.env.GCP_SERVICE_ACCOUNT_KEY!,
  sourceArchive: new pulumi.asset.FileArchive("../path/to/cws-listing/deploy"),
  sourceBucketName: "sargonpiraev-cws-listing-source",
});

// Governance: test:pulumi asserts type tokens under mocks
void WEBAPP_TYPE;
void EXTAPP_TYPE;
void MOBAPP_TYPE;
```

CF **source archives stay in the consuming stack** (meta `pulumi/dwhapp/functions/<name>`). Components wire SA/IAM/BQ/CF/Scheduler; they do not ship function source.

## Wired vs stub

| Component | Status |
| --- | --- |
| `Webapp` | **Fully wired** — successor of `@sargonpiraev/pulumi-webapp-analytics` |
| `Extapp` | **Wired** — dataset + listing table + CF + Scheduler |
| `Mobapp` | **Wired** — dataset + core tables + secrets IAM + CF + Scheduler |
| `NpmDownloadsEtl` | **Wired** — dataset + table + CF + Scheduler; optional `childAliases` for meta wrap |
| `VercelFinopsEtl` / `NeonFinopsEtl` | **Wired** — tables + secrets IAM + CF + Scheduler (finops dataset must already exist); optional `childAliases` for meta wrap |

## Migration notes

### From `WebappAnalytics` / `ExtappAnalytics` / `MobappAnalytics`

Class names and type tokens are short app-type names:

| Old | New | New type token |
| --- | --- | --- |
| `WebappAnalytics` | `Webapp` | `sargonpiraev:apps:Webapp` |
| `ExtappAnalytics` | `Extapp` | `sargonpiraev:apps:Extapp` |
| `MobappAnalytics` | `Mobapp` | `sargonpiraev:apps:Mobapp` |

Type constants: `WEBAPP_TYPE` / `EXTAPP_TYPE` / `MOBAPP_TYPE` (was `*_ANALYTICS_TYPE`).

Parent ComponentResources declare **aliases** to the previous type tokens so existing stacks (anidex / site / pddx) do not replace/create the parent URN. Child resources stay on existing `childAliases` patterns.

### From `@sargonpiraev/pulumi-webapp-analytics`

Prefer this package:

```ts
// before
import { WebappAnalytics, WEBAPP_ANALYTICS_TYPE } from "@sargonpiraev/pulumi-webapp-analytics";
// after
import { Webapp, WEBAPP_TYPE } from "@sargonpiraev/pulumi-apps";
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-apps

## Release

Published from [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) via Trusted Publishing (`repo-on-push-main.yml`).
