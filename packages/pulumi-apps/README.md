# @sargonpiraev/pulumi-apps

Pulumi **ComponentResources** for Turborepo app types + resource-triggered warehouse ETL helpers.

One package, multiple modules — not one npm package per app type.

## Exports

| Export | Type token | Role |
| --- | --- | --- |
| `WebappAnalytics` | `sargonpiraev:webapp-analytics:WebappAnalytics` | GSC property + BQ bulk-export dataset/IAM; optional GA4 ids as outputs. **No** custom CF (native GSC/GA→BQ). |
| `ExtappAnalytics` | `sargonpiraev:apps:ExtappAnalytics` | CWS listing → BQ `product_cws` + Gen1 CF + Scheduler |
| `MobappAnalytics` | `sargonpiraev:apps:MobappAnalytics` | ASC → BQ `product_appstore` + Gen1 CF + Scheduler (Play later) |
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
  WebappAnalytics,
  WEBAPP_ANALYTICS_TYPE,
  ExtappAnalytics,
  EXTAPP_ANALYTICS_TYPE,
  MobappAnalytics,
  MOBAPP_ANALYTICS_TYPE,
} from "@sargonpiraev/pulumi-apps";
import * as pulumi from "@pulumi/pulumi";

// webapp — native GSC/GA→BQ only
new WebappAnalytics("webapp-analytics", { /* … */ });

// extapp — pass CF source from meta dwhapp (or project copy)
new ExtappAnalytics("extapp-analytics", {
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
void WEBAPP_ANALYTICS_TYPE;
void EXTAPP_ANALYTICS_TYPE;
void MOBAPP_ANALYTICS_TYPE;
```

CF **source archives stay in the consuming stack** (meta `pulumi/dwhapp/functions/<name>`). Components wire SA/IAM/BQ/CF/Scheduler; they do not ship function source.

## Wired vs stub

| Component | Status |
| --- | --- |
| `WebappAnalytics` | **Fully wired** — successor of `@sargonpiraev/pulumi-webapp-analytics` (same `WEBAPP_ANALYTICS_TYPE`) |
| `ExtappAnalytics` | **Wired** — dataset + listing table + CF + Scheduler |
| `MobappAnalytics` | **Wired** — dataset + core tables + secrets IAM + CF + Scheduler |
| `NpmDownloadsEtl` | **Wired** — dataset + table + CF + Scheduler |
| `VercelFinopsEtl` / `NeonFinopsEtl` | **Wired** — tables + secrets IAM + CF + Scheduler (finops dataset must already exist) |

## Migration from `@sargonpiraev/pulumi-webapp-analytics`

Same type token and args shape. Change the package import:

```ts
// before
import { WebappAnalytics, WEBAPP_ANALYTICS_TYPE } from "@sargonpiraev/pulumi-webapp-analytics";
// after
import { WebappAnalytics, WEBAPP_ANALYTICS_TYPE } from "@sargonpiraev/pulumi-apps";
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-apps

## Release

Published from [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) via Trusted Publishing (`repo-on-push-main.yml`).
