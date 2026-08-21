/** Type tokens for project `test:pulumi` presence asserts. */
export {
  WEBAPP_TYPE,
  Webapp,
  assertRepoHasWebapp,
  repoHasWebapp,
  type WebappArgs,
  type WebappChildAliases,
  type WebappVercelArgs,
} from './webapp/index.js'

export {
  EXTAPP_TYPE,
  Extapp,
  repoHasExtapp,
  CWS_DEV_CONSOLE_URL,
  cwsPublicListingUrl,
  requireCwsItemId,
  requireCwsItemSlug,
  type ExtappArgs,
} from './extapp/index.js'

export {
  MOBAPP_TYPE,
  Mobapp,
  repoHasMobapp,
  type MobappArgs,
  type MobappAscSecretRefs,
} from './mobapp/index.js'

export {
  NPM_DOWNLOADS_ETL_TYPE,
  NpmDownloadsEtl,
  type NpmDownloadsEtlArgs,
  type NpmDownloadsEtlChildAliases,
  VERCEL_FINOPS_ETL_TYPE,
  VercelFinopsEtl,
  type VercelFinopsEtlArgs,
  type VercelFinopsEtlChildAliases,
  NEON_FINOPS_ETL_TYPE,
  NeonFinopsEtl,
  type NeonFinopsEtlArgs,
  type NeonFinopsEtlChildAliases,
} from './finops/index.js'

export { repoHasApp } from './internal/repo-has-app.js'

export { gcpProjectIdFromServiceAccountKeyB64 } from './internal/sa-key.js'

export { assertIndexInstantiatesAppClusters } from './internal/assert-index-clusters.js'
