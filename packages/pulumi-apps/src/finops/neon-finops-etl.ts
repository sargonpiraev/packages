import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import { childOpts } from "../internal/child-opts.js";
import { createHttpFunctionEtl } from "../internal/http-function-etl.js";

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const NEON_FINOPS_ETL_TYPE = "sargonpiraev:apps:NeonFinopsEtl" as const;

export type NeonFinopsEtlArgs = {
  gcpProjectId: pulumi.Input<string>;
  location: pulumi.Input<string>;
  region: pulumi.Input<string>;
  /** Existing `finops` dataset id. */
  finopsDatasetId: pulumi.Input<string>;
  neonOrgId: pulumi.Input<string>;
  neonApiKeySecretId: string;
  loaderAccountId: string;
  gcpServiceAccountKeyB64: pulumi.Input<string>;
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive;
  sourceBucketName: pulumi.Input<string>;
  sourceObjectName?: pulumi.Input<string>;
  createSecret?: boolean;
  functionName?: pulumi.Input<string>;
  entryPoint?: pulumi.Input<string>;
  schedulerJobName?: pulumi.Input<string>;
  schedulerAccountId?: string;
  deployerSaEmail?: pulumi.Input<string>;
  lookbackDays?: pulumi.Input<string>;
};

/**
 * Resource-triggered: Neon consumption → BigQuery `finops`.
 * Pattern from meta `pulumi/dwhapp/neon-finops-etl.ts`.
 */
export class NeonFinopsEtl extends pulumi.ComponentResource {
  public readonly usageTable: gcp.bigquery.Table;
  public readonly costTable: gcp.bigquery.Table;
  public readonly functionUrl: pulumi.Output<string>;

  constructor(
    name: string,
    args: NeonFinopsEtlArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super(NEON_FINOPS_ETL_TYPE, name, args, opts);

    const functionName = args.functionName ?? "neon-finops-etl";
    const entryPoint = args.entryPoint ?? "loadNeonFinops";
    const schedulerJobName = args.schedulerJobName ?? "neon-finops-daily";
    const schedulerAccountId = args.schedulerAccountId ?? "neon-finops-sched";
    const deployerSaEmail =
      args.deployerSaEmail ?? "goproj@sargonpiraev.iam.gserviceaccount.com";
    const sourceObjectName =
      args.sourceObjectName ?? "neon-finops-etl-source.zip";
    const lookbackDays = args.lookbackDays ?? "30";

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, "base64").toString("utf-8"));

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      { project: args.gcpProjectId, credentials },
      childOpts(this, undefined),
    );

    const bigqueryApi = new gcp.projects.Service(
      `${name}-bigquery-api`,
      {
        project: args.gcpProjectId,
        service: "bigquery.googleapis.com",
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider }),
    );

    const schedulerApi = new gcp.projects.Service(
      `${name}-scheduler-api`,
      {
        project: args.gcpProjectId,
        service: "cloudscheduler.googleapis.com",
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider }),
    );

    const secretManagerApi = new gcp.projects.Service(
      `${name}-secretmanager-api`,
      {
        project: args.gcpProjectId,
        service: "secretmanager.googleapis.com",
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider }),
    );

    this.usageTable = new gcp.bigquery.Table(
      `${name}-usage`,
      {
        project: args.gcpProjectId,
        datasetId: args.finopsDatasetId,
        tableId: "neon_usage_daily",
        description: "Neon consumption_history/v2 daily metrics",
        timePartitioning: { type: "DAY", field: "usage_date" },
        clusterings: ["project_id", "metric_name"],
        schema: JSON.stringify([
          { name: "usage_date", type: "DATE", mode: "REQUIRED" },
          { name: "org_id", type: "STRING", mode: "REQUIRED" },
          { name: "project_id", type: "STRING", mode: "REQUIRED" },
          { name: "metric_name", type: "STRING", mode: "REQUIRED" },
          { name: "metric_value_raw", type: "FLOAT", mode: "REQUIRED" },
          { name: "ingested_at", type: "TIMESTAMP", mode: "REQUIRED" },
        ]),
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
      }),
    );

    this.costTable = new gcp.bigquery.Table(
      `${name}-cost`,
      {
        project: args.gcpProjectId,
        datasetId: args.finopsDatasetId,
        tableId: "neon_cost_daily",
        description: "Neon estimated daily cost by project",
        timePartitioning: { type: "DAY", field: "usage_date" },
        clusterings: ["project_id"],
        schema: JSON.stringify([
          { name: "usage_date", type: "DATE", mode: "REQUIRED" },
          { name: "org_id", type: "STRING", mode: "REQUIRED" },
          { name: "project_id", type: "STRING", mode: "REQUIRED" },
          { name: "estimated_cost_usd", type: "FLOAT", mode: "NULLABLE" },
          { name: "ingested_at", type: "TIMESTAMP", mode: "REQUIRED" },
        ]),
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
      }),
    );

    const loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: "Neon → BigQuery finops loader",
        project: args.gcpProjectId,
      },
      childOpts(this, undefined, { provider: gcpProvider }),
    );

    new gcp.serviceaccount.IAMMember(
      `${name}-loader-deployer-actas`,
      {
        serviceAccountId: loaderSa.name,
        role: "roles/iam.serviceAccountUser",
        member: pulumi.interpolate`serviceAccount:${deployerSaEmail}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [loaderSa],
      }),
    );

    new gcp.projects.IAMMember(
      `${name}-loader-job-user`,
      {
        project: args.gcpProjectId,
        role: "roles/bigquery.jobUser",
        member: pulumi.interpolate`serviceAccount:${loaderSa.email}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
      }),
    );

    new gcp.bigquery.DatasetIamMember(
      `${name}-loader-data-editor`,
      {
        project: args.gcpProjectId,
        datasetId: args.finopsDatasetId,
        role: "roles/bigquery.dataEditor",
        member: pulumi.interpolate`serviceAccount:${loaderSa.email}`,
      },
      childOpts(this, undefined, { provider: gcpProvider }),
    );

    if (args.createSecret === true) {
      const secret = new gcp.secretmanager.Secret(
        `${name}-neon-key`,
        {
          secretId: args.neonApiKeySecretId,
          project: args.gcpProjectId,
          replication: { auto: {} },
          labels: { domain: "finops", source: "neon" },
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi],
        }),
      );
      new gcp.secretmanager.SecretIamMember(
        `${name}-neon-key-accessor`,
        {
          project: args.gcpProjectId,
          secretId: secret.secretId,
          role: "roles/secretmanager.secretAccessor",
          member: pulumi.interpolate`serviceAccount:${loaderSa.email}`,
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [secret, loaderSa],
        }),
      );
    } else {
      new gcp.secretmanager.SecretIamMember(
        `${name}-neon-key-accessor`,
        {
          project: args.gcpProjectId,
          secretId: args.neonApiKeySecretId,
          role: "roles/secretmanager.secretAccessor",
          member: pulumi.interpolate`serviceAccount:${loaderSa.email}`,
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi, loaderSa],
        }),
      );
    }

    const environmentVariables = pulumi
      .all([
        args.gcpProjectId,
        args.finopsDatasetId,
        args.location,
        args.neonOrgId,
        lookbackDays,
      ])
      .apply(([projectId, dataset, location, orgId, lookback]) => ({
        GOOGLE_CLOUD_PROJECT: projectId,
        GCP_BQ_DATASET_FINOPS: dataset,
        GCP_BQ_LOCATION: location,
        NEON_ORG_ID: orgId,
        NEON_LOOKBACK_DAYS: lookback,
      }));

    const secretEnvironmentVariables = pulumi
      .output(args.gcpProjectId)
      .apply((projectId) => [
        {
          key: "NEON_API_KEY",
          projectId,
          secret: args.neonApiKeySecretId,
          version: "latest",
        },
      ]);

    const etl = createHttpFunctionEtl({
      name: `${name}-etl`,
      projectId: args.gcpProjectId,
      location: args.location,
      region: args.region,
      provider: gcpProvider,
      parent: this,
      functionName,
      description: "Pull Neon consumption/cost into BigQuery finops",
      entryPoint,
      availableMemoryMb: 512,
      timeoutSeconds: 300,
      serviceAccountEmail: loaderSa.email,
      environmentVariables,
      secretEnvironmentVariables,
      sourceArchive: args.sourceArchive,
      sourceObjectName,
      sourceBucketName: args.sourceBucketName,
      schedulerJobName,
      schedulerAccountId,
      schedulerDescription: "Daily Neon finops ETL",
      deployerSaEmail,
      schedulerApi,
      dependsOn: [this.usageTable, this.costTable, loaderSa],
      ignoreSecretEnvDiff: true,
    });

    this.functionUrl = etl.functionUrl;

    this.registerOutputs({
      functionUrl: this.functionUrl,
      scheduleJobName: etl.scheduleJob.name,
      usageTableId: this.usageTable.tableId,
      costTableId: this.costTable.tableId,
    });
  }
}
