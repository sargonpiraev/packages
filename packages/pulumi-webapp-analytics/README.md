# @sargonpiraev/pulumi-webapp-analytics

Pulumi **ComponentResource** for public web product analytics (`apps/webapp` / public `docapp`):

- Google Search Console property (`@sargonpiraev/pulumi-gsc`)
- BigQuery bulk-export dataset + GSC export IAM (`@pulumi/gcp`)
- Optional GA4 measurement / property ids as outputs (no first-class GA4→BQ resource in `@pulumi/gcp` yet)

## Install

```bash
npm install @sargonpiraev/pulumi-webapp-analytics
```

## Usage

```ts
import {
  WebappAnalytics,
  WEBAPP_ANALYTICS_TYPE,
  repoHasWebapp,
} from "@sargonpiraev/pulumi-webapp-analytics";

if (!repoHasWebapp(repoRoot)) {
  throw new Error("apps/webapp required");
}

const analytics = new WebappAnalytics("webapp-analytics", {
  gcpProjectId: "sargonpiraev",
  datasetId: "searchconsole_anidex",
  location: "EU",
  gscSiteUrl: "sc-domain:anidex.tv",
  gscServiceAccountKeyB64: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
  gcpServiceAccountKeyB64: process.env.GCP_SERVICE_ACCOUNT_KEY!,
  datasetDescription: "GSC bulk export for anidex.tv",
  datasetLabels: { product: "anidex", source: "gsc", domain: "product" },
  adoptExisting: true,
  datasetImportId: "projects/sargonpiraev/datasets/searchconsole_anidex",
});

// Governance: test:pulumi asserts WEBAPP_ANALYTICS_TYPE is registered under mocks.
void WEBAPP_ANALYTICS_TYPE;
void analytics.datasetId;
```

## Type token

`sargonpiraev:webapp-analytics:WebappAnalytics` (`WEBAPP_ANALYTICS_TYPE`)

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-webapp-analytics

## Release

Published from [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) via Trusted Publishing (`repo-on-push-main.yml`).
