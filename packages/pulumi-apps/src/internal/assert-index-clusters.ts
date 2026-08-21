import fs from 'node:fs'
import path from 'node:path'
import { repoHasApp, repoHasExtapp, repoHasMobapp, repoHasWebapp } from './repo-has-app.js'

/** Non-empty file under `pulumi/` parks the Webapp GSC/GA4/Vercel cluster. */
export const WEBAPP_CLUSTER_DEFER_FILE = 'defer-webapp-cluster'

export function defersWebappCluster(repoRoot: string): boolean {
  const marker = path.join(repoRoot, 'pulumi', WEBAPP_CLUSTER_DEFER_FILE)
  return fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').trim().length > 0
}

const WEBAPP_CALL = /\b(?:createWebappProductAnalytics|new\s+Webapp)\s*\(/
const EXTAPP_CALL = /\b(?:createExtappProductAnalytics|new\s+Extapp)\s*\(/
const MOBAPP_CALL = /\b(?:createMobappProductAnalytics|new\s+Mobapp)\s*\(/

export function stripTsComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

/**
 * `apps/webapp` or public `apps/docapp` ⇒ `Webapp` must be constructed from
 * `pulumi/index.ts` (not only from a wrapper that tests import).
 */
export function assertIndexInstantiatesAppClusters(args: {
  repoRoot: string
  indexSource: string
}): void {
  const src = stripTsComments(args.indexSource)
  const missing: string[] = []
  if (
    (repoHasWebapp(args.repoRoot) || repoHasApp(args.repoRoot, 'docapp')) &&
    !defersWebappCluster(args.repoRoot) &&
    !WEBAPP_CALL.test(src)
  ) {
    missing.push(
      'apps/webapp (or apps/docapp) requires createWebappProductAnalytics(...) or new Webapp(...) in pulumi/index.ts'
    )
  }
  if (repoHasExtapp(args.repoRoot) && !EXTAPP_CALL.test(src)) {
    missing.push(
      'apps/extapp requires createExtappProductAnalytics(...) or new Extapp(...) in pulumi/index.ts'
    )
  }
  if (repoHasMobapp(args.repoRoot) && !MOBAPP_CALL.test(src)) {
    missing.push(
      'apps/mobapp requires createMobappProductAnalytics(...) or new Mobapp(...) in pulumi/index.ts'
    )
  }
  if (missing.length > 0) {
    throw new Error(missing.join('\n'))
  }
}
