import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Rule } from 'eslint'
import { createJiti } from 'jiti'

export type PlaywrightAppKind = 'webapp' | 'docapp' | 'extapp'

export const REQUIRED_PLAYWRIGHT_PROJECTS = {
  webapp: ['functional', 'seo', 'analytics', 'visual'],
  docapp: ['functional', 'seo', 'analytics', 'visual'],
  extapp: ['functional', 'visual'],
} as const satisfies Record<PlaywrightAppKind, readonly string[]>

const WEB_SUITE_NAME =
  /^(functional|seo|analytics|visual)(-[a-z0-9]+)?$/
const EXT_SUITE_NAME = /^(functional|visual)$/

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  'coverage',
  'dist',
  'build',
  'out',
  '.turbo',
  '.git',
  'playwright-report',
  'test-results',
])

type PlaywrightProject = {
  name?: string
  testMatch?: string | string[] | RegExp
}

type PlaywrightConfig = {
  projects?: PlaywrightProject[]
}

/**
 * Infer gated app kind from playwright.config.ts path.
 * Flat-root configs (kithub, site) are treated as webapp.
 */
export function inferPlaywrightAppKind(
  filename: string,
): PlaywrightAppKind | null {
  const normalized = filename.replace(/\\/g, '/')
  const nested = normalized.match(
    /\/apps\/(webapp|docapp|extapp)\/playwright\.config\.ts$/,
  )
  if (nested) {
    return nested[1] as PlaywrightAppKind
  }
  if (
    /\/playwright\.config\.ts$/.test(normalized) &&
    !normalized.includes('/apps/')
  ) {
    return 'webapp'
  }
  return null
}

export function isAllowedProjectName(
  appKind: PlaywrightAppKind,
  name: string,
): boolean {
  if (appKind === 'extapp') {
    return EXT_SUITE_NAME.test(name)
  }
  return WEB_SUITE_NAME.test(name)
}

export function testMatchCoversSuite(
  testMatch: unknown,
  suite: string,
): boolean {
  const needle = `.${suite}.spec.ts`
  const values = Array.isArray(testMatch)
    ? testMatch
    : testMatch == null
      ? []
      : [testMatch]
  return values.some((value) => {
    if (typeof value === 'string') {
      return value.includes(needle)
    }
    if (value instanceof RegExp) {
      return value.source.includes(needle.replace(/\./g, '\\.')) ||
        value.source.includes(suite)
    }
    return false
  })
}

export function hasSuiteSpecFile(appRoot: string, suite: string): boolean {
  const suffix = `.${suite}.spec.ts`
  const stack = [appRoot]
  while (stack.length > 0) {
    const dir = stack.pop()
    if (!dir) break
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          stack.push(full)
        }
        continue
      }
      if (entry.isFile() && entry.name.endsWith(suffix)) {
        return true
      }
    }
  }
  return false
}

const STUBS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'stubs')
const PLAYWRIGHT_TEST_STUB = path.join(STUBS_DIR, 'playwright-test.js')
const NEXTCOV_STUB = path.join(STUBS_DIR, 'nextcov.js')

export function loadPlaywrightConfig(configPath: string): PlaywrightConfig {
  // Stub @playwright/test: real Playwright forbids loading twice in one process,
  // and meta lint evaluates many configs in one ESLint run.
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    moduleCache: false,
    alias: {
      '@playwright/test': PLAYWRIGHT_TEST_STUB,
      nextcov: NEXTCOV_STUB,
    },
  })
  // Sync require-style API — ESLint rules are synchronous.
  const mod = jiti(configPath) as { default?: unknown } | PlaywrightConfig
  const config =
    mod && typeof mod === 'object' && 'default' in mod && mod.default != null
      ? mod.default
      : mod
  if (!config || typeof config !== 'object') {
    throw new Error('Playwright config did not export an object')
  }
  return config as PlaywrightConfig
}

export const playwrightConfigRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Evaluate playwright.config.ts: required project names, testMatch, and suite spec files',
    },
    schema: [],
    messages: {
      loadFailed: 'Failed to load playwright.config.ts: {{error}}',
      missingProjects: 'playwright.config.ts must export projects[]',
      missingProject:
        'playwright.config.ts projects must include "{{name}}" for {{app}}',
      unknownProject:
        'playwright.config.ts project "{{name}}" is not allowed for {{app}}',
      badTestMatch:
        'playwright project "{{name}}" testMatch must cover *.{{name}}.spec.ts',
      missingSpec:
        'missing at least one *.{{name}}.spec.ts under {{appRoot}} for required suite "{{name}}"',
    },
  },
  create(context) {
    // Processor may rewrite filename to …/playwright.config.ts/0.js
    const filename = (
      context.physicalFilename || context.filename
    ).replace(/\/\d+\.js$/, '')
    const appKind = inferPlaywrightAppKind(filename)
    if (!appKind) {
      return {}
    }

    return {
      Program(node) {
        const required = REQUIRED_PLAYWRIGHT_PROJECTS[appKind]
        const appRoot = path.dirname(filename)

        let config: PlaywrightConfig
        try {
          config = loadPlaywrightConfig(filename)
        } catch (error) {
          context.report({
            node,
            messageId: 'loadFailed',
            data: {
              error: error instanceof Error ? error.message : String(error),
            },
          })
          return
        }

        const projects = config.projects
        if (!Array.isArray(projects)) {
          context.report({ node, messageId: 'missingProjects' })
          return
        }

        const byName = new Map<string, PlaywrightProject>()
        for (const project of projects) {
          const name = project?.name
          if (typeof name !== 'string' || !name) {
            continue
          }
          if (!isAllowedProjectName(appKind, name)) {
            context.report({
              node,
              messageId: 'unknownProject',
              data: { name, app: appKind },
            })
          }
          byName.set(name, project)
        }

        for (const name of required) {
          const project = byName.get(name)
          if (!project) {
            context.report({
              node,
              messageId: 'missingProject',
              data: { name, app: appKind },
            })
            continue
          }
          if (!testMatchCoversSuite(project.testMatch, name)) {
            context.report({
              node,
              messageId: 'badTestMatch',
              data: { name },
            })
          }
          if (!hasSuiteSpecFile(appRoot, name)) {
            context.report({
              node,
              messageId: 'missingSpec',
              data: {
                name,
                appRoot: path.basename(appRoot) || appRoot,
              },
            })
          }
        }
      },
    }
  },
}
