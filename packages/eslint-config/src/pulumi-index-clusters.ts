import fs from 'node:fs'
import path from 'node:path'

const WEBAPP_CALL = /\b(?:createWebappProductAnalytics|new\s+Webapp)\s*\(/
const EXTAPP_CALL = /\b(?:createExtappProductAnalytics|new\s+Extapp)\s*\(/
const MOBAPP_CALL = /\b(?:createMobappProductAnalytics|new\s+Mobapp)\s*\(/

export function stripTsComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

function hasAppDir(repoRoot: string, appType: string): boolean {
  return fs.existsSync(path.join(repoRoot, 'apps', appType))
}

/** Gaps when `pulumi/index.ts` does not construct the cluster for an `apps/<type>` dir. */
export function missingPulumiIndexClusterMessages(repoRoot: string, indexSource: string): string[] {
  const src = stripTsComments(indexSource)
  const missing: string[] = []
  if ((hasAppDir(repoRoot, 'webapp') || hasAppDir(repoRoot, 'docapp')) && !WEBAPP_CALL.test(src)) {
    missing.push(
      'apps/webapp (or apps/docapp) requires createWebappProductAnalytics(...) or new Webapp(...) in pulumi/index.ts'
    )
  }
  if (hasAppDir(repoRoot, 'extapp') && !EXTAPP_CALL.test(src)) {
    missing.push(
      'apps/extapp requires createExtappProductAnalytics(...) or new Extapp(...) in pulumi/index.ts'
    )
  }
  if (hasAppDir(repoRoot, 'mobapp') && !MOBAPP_CALL.test(src)) {
    missing.push(
      'apps/mobapp requires createMobappProductAnalytics(...) or new Mobapp(...) in pulumi/index.ts'
    )
  }
  return missing
}
