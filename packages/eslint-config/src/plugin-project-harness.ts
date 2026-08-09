import fs from 'node:fs'
import path from 'node:path'
import type { ESLint, Rule } from 'eslint'
import {
  CANONICAL_APP_NAMES,
  ENV_CONTRACT_APP_NAMES,
  FORBIDDEN_APP_NAMES,
  PRETTIER_CONFIG_PACKAGE,
  TSCONFIG_PACKAGE_PREFIX,
} from './canonical-apps.js'

type RepoHarness = {
  layout?: string
  apps?: string[]
}

type EnvHarness = {
  requiredKeys?: Record<string, string[]>
}

function projectRootFromFilename(filename: string): string {
  return path.dirname(filename)
}

function readJsonFile<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return undefined
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return undefined
  }
}

function listAppDirs(root: string): string[] {
  const appsDir = path.join(root, 'apps')
  if (!fs.existsSync(appsDir) || !fs.statSync(appsDir).isDirectory()) {
    return []
  }
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort()
}

function hasTsconfigExtendsShared(root: string): {
  ok: boolean
  path?: string
  reason?: string
} {
  for (const name of ['tsconfig.json', 'tsconfig.base.json']) {
    const filePath = path.join(root, name)
    const data = readJsonFile<{
      extends?: string | string[]
      compilerOptions?: { strict?: boolean }
    }>(filePath)
    if (!data) continue
    const ext = data.extends
    const list = Array.isArray(ext) ? ext : ext ? [ext] : []
    const hits = list.some((e) => e.startsWith(TSCONFIG_PACKAGE_PREFIX))
    if (!hits) {
      return {
        ok: false,
        path: filePath,
        reason: `${name} must extend ${TSCONFIG_PACKAGE_PREFIX}/base.json`,
      }
    }
    if (data.compilerOptions && data.compilerOptions.strict === false) {
      return {
        ok: false,
        path: filePath,
        reason: `${name} must not set compilerOptions.strict to false`,
      }
    }
    return { ok: true, path: filePath }
  }
  return {
    ok: false,
    reason: `missing root tsconfig.json or tsconfig.base.json extending ${TSCONFIG_PACKAGE_PREFIX}`,
  }
}

function envExamplePath(root: string, appKey: string): string {
  if (appKey === '.') return path.join(root, '.env.example')
  return path.join(root, 'apps', appKey, '.env.example')
}

function envExampleHasKeys(filePath: string, keys: string[]): string[] {
  if (!fs.existsSync(filePath)) return keys
  const text = fs.readFileSync(filePath, 'utf8')
  const present = new Set(
    text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split('=')[0]?.trim())
      .filter(Boolean),
  )
  return keys.filter((k) => !present.has(k))
}

const inventoryRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Hard project harness: prettier, tsconfig, repo apps, env, pulumi, npm token hygiene',
    },
    schema: [],
    messages: {
      missingPrettier:
        'package.json must set "prettier": "{{pkg}}" (shared Prettier config).',
      missingTsconfig: '{{reason}}',
      missingRepoHarness:
        'missing repo.harness.json (declare layout + canonical apps).',
      invalidRepoHarness: 'repo.harness.json: {{reason}}',
      forbiddenApp: 'forbidden apps/* name "{{name}}" (use canonical allowlist).',
      unknownApp: 'apps/* "{{name}}" is not in the canonical allowlist.',
      appsMismatch:
        'repo.harness.json apps {{harness}} must match apps/* on disk {{disk}}.',
      missingTurbo: 'layout {{layout}} requires turbo.json at project root.',
      flatNextForbidden:
        'flat-root Next project app is forbidden; use turbo monorepo with apps/webapp (etc.).',
      missingEnvHarness:
        'apps {{apps}} require env.harness.json with requiredKeys (names-only).',
      missingEnvExample: 'missing {{path}} for env.harness.json contract.',
      missingEnvKeys: '{{path}} missing required keys: {{keys}}',
      missingPulumiYaml: 'pulumi/ exists but pulumi/Pulumi.yaml is missing.',
      missingPulumiEntry:
        'pulumi/ exists but TypeScript entry missing (index.ts or src/index.ts; or set pulumi.harness.json).',
      missingPulumiScripts:
        'pulumi/ exists but package.json scripts must include pulumi:preview and pulumi:up.',
      npmrcToken:
        'committed .npmrc must not contain npm tokens / auth (use Trusted Publishing OIDC).',
    },
  },
  create(context) {
    const root = projectRootFromFilename(context.filename)

    return {
      Program(node) {
        const pkg = readJsonFile<{
          prettier?: unknown
          scripts?: Record<string, string>
          dependencies?: Record<string, string>
          devDependencies?: Record<string, string>
        }>(context.filename)
        if (!pkg) return

        if (pkg.prettier !== PRETTIER_CONFIG_PACKAGE) {
          context.report({
            node,
            messageId: 'missingPrettier',
            data: { pkg: PRETTIER_CONFIG_PACKAGE },
          })
        }

        const ts = hasTsconfigExtendsShared(root)
        if (!ts.ok) {
          context.report({
            node,
            messageId: 'missingTsconfig',
            data: { reason: ts.reason ?? 'invalid tsconfig' },
          })
        }

        const npmrcPath = path.join(root, '.npmrc')
        if (fs.existsSync(npmrcPath)) {
          const npmrc = fs.readFileSync(npmrcPath, 'utf8')
          if (
            /(_authToken|authToken|NPM_TOKEN|\/\/registry\.npmjs\.org\/:_auth)/i.test(
              npmrc,
            )
          ) {
            context.report({ node, messageId: 'npmrcToken' })
          }
        }

        const diskApps = listAppDirs(root)
        for (const name of diskApps) {
          if ((FORBIDDEN_APP_NAMES as readonly string[]).includes(name)) {
            context.report({
              node,
              messageId: 'forbiddenApp',
              data: { name },
            })
          } else if (
            !(CANONICAL_APP_NAMES as readonly string[]).includes(name)
          ) {
            context.report({
              node,
              messageId: 'unknownApp',
              data: { name },
            })
          }
        }

        const deps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        }
        const hasNext = Boolean(deps?.next)
        if (hasNext && diskApps.length === 0) {
          context.report({ node, messageId: 'flatNextForbidden' })
        }

        const pulumiDir = path.join(root, 'pulumi')
        if (fs.existsSync(pulumiDir) && fs.statSync(pulumiDir).isDirectory()) {
          if (!fs.existsSync(path.join(pulumiDir, 'Pulumi.yaml'))) {
            context.report({ node, messageId: 'missingPulumiYaml' })
          }
          const harness = readJsonFile<{ entry?: string }>(
            path.join(root, 'pulumi.harness.json'),
          )
          const entry = harness?.entry ?? 'index.ts'
          const entryPath = path.join(pulumiDir, entry)
          const fallback = path.join(pulumiDir, 'src', 'index.ts')
          if (!fs.existsSync(entryPath) && !fs.existsSync(fallback)) {
            context.report({ node, messageId: 'missingPulumiEntry' })
          }
          const scripts = pkg.scripts ?? {}
          if (!scripts['pulumi:preview'] || !scripts['pulumi:up']) {
            context.report({ node, messageId: 'missingPulumiScripts' })
          }
        }

        const repoPath = path.join(root, 'repo.harness.json')
        const repo = readJsonFile<RepoHarness>(repoPath)
        if (!repo) {
          context.report({ node, messageId: 'missingRepoHarness' })
          return
        }

        const harnessApps = [...(repo.apps ?? [])].sort()
        if (JSON.stringify(harnessApps) !== JSON.stringify(diskApps)) {
          context.report({
            node,
            messageId: 'appsMismatch',
            data: {
              harness: JSON.stringify(harnessApps),
              disk: JSON.stringify(diskApps),
            },
          })
        }

        if (
          (repo.layout === 'turbo' || repo.layout === 'turbo-lib') &&
          !fs.existsSync(path.join(root, 'turbo.json'))
        ) {
          context.report({
            node,
            messageId: 'missingTurbo',
            data: { layout: repo.layout },
          })
        }

        const envApps = harnessApps.filter((a) =>
          (ENV_CONTRACT_APP_NAMES as readonly string[]).includes(a),
        )
        if (envApps.length > 0) {
          const envPath = path.join(root, 'env.harness.json')
          const env = readJsonFile<EnvHarness>(envPath)

          // Names-only env.harness.json + .env.example (no env.ts SSOT).
          if (!env?.requiredKeys) {
            context.report({
              node,
              messageId: 'missingEnvHarness',
              data: { apps: envApps.join(', ') },
            })
          } else {
            for (const [appKey, keys] of Object.entries(env.requiredKeys)) {
              const example = envExamplePath(root, appKey)
              if (!fs.existsSync(example)) {
                context.report({
                  node,
                  messageId: 'missingEnvExample',
                  data: { path: path.relative(root, example) },
                })
                continue
              }
              const missing = envExampleHasKeys(example, keys)
              if (missing.length > 0) {
                context.report({
                  node,
                  messageId: 'missingEnvKeys',
                  data: {
                    path: path.relative(root, example),
                    keys: missing.join(', '),
                  },
                })
              }
            }
          }
        }
      },
    }
  },
}

const workflowTokenRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid NPM_TOKEN / NODE_AUTH_TOKEN in on-push-main workflow (OIDC Trusted Publishing)',
    },
    schema: [],
    messages: {
      npmToken:
        'workflow must not reference {{token}} — use npm Trusted Publishing (OIDC), not npm tokens.',
      missingIdToken:
        'npm publish / release job should set permissions.id-token: write for Trusted Publishing.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const text = fs.readFileSync(context.filename, 'utf8')
        // Strip YAML comments / ignore documentary mentions of banned tokens.
        const code = text
          .split('\n')
          .map((line) => line.replace(/#.*$/, ''))
          .join('\n')
        for (const token of ['NPM_TOKEN', 'NODE_AUTH_TOKEN']) {
          if (code.includes(token)) {
            context.report({
              node,
              messageId: 'npmToken',
              data: { token },
            })
          }
        }
        const publishes =
          /npm publish|multi-semantic-release|semantic-release/i.test(text)
        if (publishes && !/id-token:\s*write/.test(text)) {
          context.report({ node, messageId: 'missingIdToken' })
        }
      },
    }
  },
}

export const projectHarnessPlugin: ESLint.Plugin = {
  meta: {
    name: '@sargonpiraev/eslint-config/project-harness',
    version: '0.0.0',
  },
  rules: {
    inventory: inventoryRule,
    'workflow-no-npm-token': workflowTokenRule,
  },
}
