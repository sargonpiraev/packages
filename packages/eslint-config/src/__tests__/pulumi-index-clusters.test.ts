import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { missingPulumiIndexClusterMessages } from '../pulumi-index-clusters.js'

function tmpRepo(apps: string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-pulumi-index-'))
  for (const app of apps) {
    fs.mkdirSync(path.join(root, 'apps', app), { recursive: true })
  }
  return root
}

describe('missingPulumiIndexClusterMessages', () => {
  it('requires Webapp when apps/webapp exists', () => {
    assert.equal(
      missingPulumiIndexClusterMessages(tmpRepo(['webapp']), 'export const x = 1').length,
      1
    )
  })

  it('skips Webapp when pulumi/defer-webapp-cluster is non-empty', () => {
    const root = tmpRepo(['webapp'])
    fs.mkdirSync(path.join(root, 'pulumi'))
    fs.writeFileSync(path.join(root, 'pulumi', 'defer-webapp-cluster'), 'parked\n')
    assert.deepEqual(missingPulumiIndexClusterMessages(root, 'export const x = 1'), [])
  })

  it('passes when index constructs Webapp', () => {
    assert.deepEqual(
      missingPulumiIndexClusterMessages(tmpRepo(['webapp']), 'createWebappProductAnalytics({})'),
      []
    )
  })
})
