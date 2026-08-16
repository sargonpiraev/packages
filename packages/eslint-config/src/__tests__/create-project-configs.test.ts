import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CANONICAL_APP_NAMES,
  createProjectConfigs,
  inferPlaywrightAppKind,
  isAllowedProjectName,
  patternCoversPulumiEnv,
  patternCoversPulumiState,
  patternIgnoresWholePulumiTree,
  REQUIRED_PLAYWRIGHT_PROJECTS,
  schemas,
  testMatchCoversSuite,
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
      (c) => Array.isArray(c.files) && c.files.includes('tsconfig.json'),
    )
    assert.ok(tsconfig)

    const lefthook = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('lefthook.yml'),
    )
    assert.ok(lefthook)
    assert.ok(lefthook.files?.includes('lefthook.yaml'))

    const gitignore = configs.find(
      (c) => Array.isArray(c.files) && c.files.includes('.gitignore'),
    )
    assert.ok(gitignore)
    assert.equal(
      gitignore.rules?.['project-harness/pulumi-gitignore'],
      'error',
    )

    const playwright = configs.find(
      (c) =>
        Array.isArray(c.files) &&
        c.files.includes('apps/webapp/playwright.config.ts'),
    )
    assert.ok(playwright)
    assert.ok(playwright.files?.includes('playwright.config.ts'))
    assert.ok(playwright.files?.includes('apps/extapp/playwright.config.ts'))
    assert.equal(
      playwright.rules?.['project-harness/playwright-config'],
      'error',
    )
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

    const gitignore = configs.find(
      (c) =>
        Array.isArray(c.files) &&
        c.files.includes('*/.gitignore') &&
        c.files.includes('.gitignore'),
    )
    assert.ok(gitignore)

    const playwright = configs.find(
      (c) =>
        Array.isArray(c.files) &&
        c.files.includes('*/apps/webapp/playwright.config.ts'),
    )
    assert.ok(playwright)
    assert.ok(playwright.files?.includes('*/playwright.config.ts'))
  })

  it('accepts reasonable pulumi gitignore pattern equivalents', () => {
    assert.equal(patternCoversPulumiEnv('.env'), true)
    assert.equal(patternCoversPulumiEnv('**/.env'), true)
    assert.equal(patternCoversPulumiEnv('pulumi/.env'), true)
    assert.equal(patternCoversPulumiEnv('.env*'), true)
    assert.equal(patternCoversPulumiEnv('.env.local'), false)
    assert.equal(patternCoversPulumiState('.pulumi/'), true)
    assert.equal(patternCoversPulumiState('**/.pulumi/'), true)
    assert.equal(patternCoversPulumiState('pulumi/.pulumi'), true)
    assert.equal(patternIgnoresWholePulumiTree('pulumi/'), true)
    assert.equal(patternIgnoresWholePulumiTree('pulumi/.env'), false)
  })

  it('exports project schemas and canonical apps', () => {
    assert.match(String(schemas.projectProject.title), /project\.json/i)
    assert.ok(schemas.projectRepoHarness)
    assert.ok(schemas.projectEnvHarness)
    assert.ok(schemas.projectTsconfig)
    assert.ok(schemas.projectReleaserc)
    assert.ok(schemas.projectLefthook)
    assert.deepEqual(schemas.projectLefthook.required, ['remotes'])
    const packageScripts = (
      schemas.projectPackage as {
        properties: {
          scripts: {
            required: string[]
            properties: { prepare: { pattern: string } }
          }
        }
      }
    ).properties.scripts
    assert.ok(packageScripts.required.includes('prepare'))
    assert.match(packageScripts.properties.prepare.pattern, /lefthook/)
    assert.ok(!('appPlaywrightWebapp' in schemas))
    assert.ok(!('appPlaywrightExtapp' in schemas))
    assert.ok(CANONICAL_APP_NAMES.includes('webapp'))
    assert.ok(CANONICAL_APP_NAMES.includes('admapp'))
  })

  it('infers playwright app kind and suite matrix', () => {
    assert.equal(
      inferPlaywrightAppKind('/repo/apps/webapp/playwright.config.ts'),
      'webapp',
    )
    assert.equal(
      inferPlaywrightAppKind('/repo/apps/docapp/playwright.config.ts'),
      'docapp',
    )
    assert.equal(
      inferPlaywrightAppKind('/repo/apps/extapp/playwright.config.ts'),
      'extapp',
    )
    assert.equal(
      inferPlaywrightAppKind('/repo/playwright.config.ts'),
      'webapp',
    )
    assert.equal(
      inferPlaywrightAppKind('/repo/apps/admapp/playwright.config.ts'),
      null,
    )
    assert.deepEqual(REQUIRED_PLAYWRIGHT_PROJECTS.webapp, [
      'functional',
      'seo',
      'analytics',
      'visual',
      'cwv',
    ])
    assert.deepEqual(REQUIRED_PLAYWRIGHT_PROJECTS.docapp, [
      'functional',
      'seo',
      'analytics',
      'visual',
      'cwv',
    ])
    assert.deepEqual(REQUIRED_PLAYWRIGHT_PROJECTS.extapp, [
      'functional',
      'visual',
    ])
    assert.equal(isAllowedProjectName('webapp', 'visual-mobile'), true)
    assert.equal(isAllowedProjectName('webapp', 'cwv'), true)
    assert.equal(isAllowedProjectName('extapp', 'cwv'), false)
    assert.equal(isAllowedProjectName('extapp', 'visual-mobile'), false)
    assert.equal(
      testMatchCoversSuite('**/*.functional.spec.ts', 'functional'),
      true,
    )
    assert.equal(testMatchCoversSuite('**/*.seo.spec.ts', 'functional'), false)
  })
})
