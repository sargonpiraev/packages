import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const indexSource = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8')

function stripTsComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

function repoHasApp(appType: string): boolean {
  return fs.existsSync(path.join(repoRoot, 'apps', appType))
}

describe('pulumi/index.ts app-type clusters', () => {
  it('instantiates Webapp/Extapp/Mobapp when the matching apps/ dir exists', () => {
    const src = stripTsComments(indexSource)
    if (repoHasApp('webapp') || repoHasApp('docapp')) {
      assert.match(
        src,
        /\b(?:createWebappProductAnalytics|new\s+Webapp)\s*\(/,
        'apps/webapp (or apps/docapp) requires createWebappProductAnalytics(...) or new Webapp(...) in pulumi/index.ts'
      )
    }
    if (repoHasApp('extapp')) {
      assert.match(
        src,
        /\b(?:createExtappProductAnalytics|new\s+Extapp)\s*\(/,
        'apps/extapp requires createExtappProductAnalytics(...) or new Extapp(...) in pulumi/index.ts'
      )
    }
    if (repoHasApp('mobapp')) {
      assert.match(
        src,
        /\b(?:createMobappProductAnalytics|new\s+Mobapp)\s*\(/,
        'apps/mobapp requires createMobappProductAnalytics(...) or new Mobapp(...) in pulumi/index.ts'
      )
    }
  })
})
