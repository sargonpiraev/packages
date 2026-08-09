import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CANONICAL_APP_NAMES,
  createProjectConfigs,
  schemas,
} from '../index.js'

describe('createProjectConfigs', () => {
  it('returns inventory + harness + workflow + repo gates for project scope', () => {
    const configs = createProjectConfigs({ scope: 'project' })
    assert.ok(configs.length >= 8)

    const inventory = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('project.json'),
    )
    assert.ok(inventory)
    assert.ok(inventory.files?.includes('package.json'))
    assert.ok(inventory.files?.includes('.cursor/worktrees.json'))

    const repo = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('repo.harness.json'),
    )
    assert.ok(repo)

    const tsconfig = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('tsconfig.base.json'),
    )
    assert.ok(tsconfig)

    const lefthook = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('lefthook.yml'),
    )
    assert.ok(lefthook)
    assert.ok(lefthook.files?.includes('lefthook.yaml'))
  })

  it('prefixes sibling root globs for meta scope (not deep package.json)', () => {
    const configs = createProjectConfigs({ scope: 'meta' })
    const inventory = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('*/project.json'),
    )
    assert.ok(inventory)
    assert.ok(inventory.files?.includes('*/package.json'))
    assert.equal(
      (inventory.files as string[]).includes('**/package.json'),
      false,
    )
    assert.ok(inventory.files?.includes('*/.cursor/worktrees.json'))

    const lefthook = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('*/lefthook.yml'),
    )
    assert.ok(lefthook)
  })

  it('exports project schemas and canonical apps', () => {
    assert.match(String(schemas.projectProject.title), /project\.json/i)
    assert.ok(schemas.projectRepoHarness)
    assert.ok(schemas.projectEnvHarness)
    assert.ok(schemas.projectTsconfig)
    assert.ok(schemas.projectReleaserc)
    assert.ok(schemas.projectLefthook)
    assert.deepEqual(schemas.projectLefthook.required, ['remotes'])
    assert.deepEqual(
      schemas.appPlaywrightWebapp.required,
      expectArrayContaining(
        ['app', 'projects'],
        schemas.appPlaywrightWebapp.required,
      ),
    )
    assert.equal(
      (schemas.appPlaywrightExtapp.properties as { app: { const: string } }).app
        .const,
      'extapp',
    )
    assert.ok(CANONICAL_APP_NAMES.includes('webapp'))
    assert.ok(CANONICAL_APP_NAMES.includes('admapp'))
  })
})

function expectArrayContaining(expected: string[], actual: unknown): string[] {
  assert.ok(Array.isArray(actual))
  for (const item of expected) {
    assert.ok(actual.includes(item), `missing ${item}`)
  }
  return actual as string[]
}
