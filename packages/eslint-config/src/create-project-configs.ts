import type { Linter } from 'eslint'
import eslintPluginJsonSchemaValidator from 'eslint-plugin-json-schema-validator'
import { projectHarnessPlugin } from './plugin-project-harness.js'
import { schemas } from './schemas.js'

export type ProjectConfigScope = 'project' | 'meta'

export type CreateProjectConfigsOptions = {
  /** project = files at package root; meta = sibling project globs under meta cwd */
  scope?: ProjectConfigScope
}

const schemaRuleOptions = {
  useSchemastoreCatalog: false,
  // Use options schema only. Do not load file $schema (relative paths
  // like ../schema/... throw Invalid URL inside the plugin).
  mergeSchemas: ['options', 'catalog'] as const,
}

function expand(scope: ProjectConfigScope, patterns: string[]): string[] {
  if (scope === 'project') {
    return patterns
  }
  return patterns.flatMap((pattern) => {
    const sibling = `*/${pattern}`
    const deep = `**/${pattern}`
    return sibling === deep ? [sibling] : [sibling, deep]
  })
}

// Meta: only project-root globs (star/file), never deep **/ — avoids app package.json / tsconfig.
function expandRoot(scope: ProjectConfigScope, patterns: string[]): string[] {
  if (scope === 'project') {
    return patterns
  }
  return patterns.map((pattern) => `*/${pattern}`)
}

function schemaRule(
  schemaEntries: Array<{ fileMatch: string[]; schema: object }>,
): Linter.Config['rules'] {
  return {
    'json-schema-validator/no-invalid': [
      'error',
      {
        schemas: schemaEntries,
        ...schemaRuleOptions,
      },
    ],
  }
}

/**
 * Project inventory / harness JSON schema gate (flat config).
 * Use `scope: 'project'` inside a project repo; `scope: 'meta'` from the meta root.
 */
export function createProjectConfigs(
  options: CreateProjectConfigsOptions = {},
): Linter.Config[] {
  const scope = options.scope ?? 'project'

  const inventoryFiles = expandRoot(scope, [
    'project.json',
    'package.json',
    '.cursor/worktrees.json',
  ])
  const playwrightConfigFiles =
    scope === 'project'
      ? [
          'playwright.config.ts',
          'apps/webapp/playwright.config.ts',
          'apps/docapp/playwright.config.ts',
          'apps/extapp/playwright.config.ts',
        ]
      : [
          '*/playwright.config.ts',
          '*/apps/webapp/playwright.config.ts',
          '*/apps/docapp/playwright.config.ts',
          '*/apps/extapp/playwright.config.ts',
        ]
  const workflowFiles = expandRoot(scope, [
    '.github/workflows/on-push-main.yml',
  ])
  const repoHarnessFiles = expandRoot(scope, ['repo.harness.json'])
  const envHarnessFiles = expandRoot(scope, ['env.harness.json'])
  const pulumiHarnessFiles = expandRoot(scope, ['pulumi.harness.json'])
  const tsconfigFiles = expandRoot(scope, [
    'tsconfig.json',
    'tsconfig.base.json',
  ])
  // Package-level .releaserc.json (e.g. packages/packages/*) + project root
  const releasercFiles = expand(scope, ['.releaserc.json'])
  const lefthookFiles = expandRoot(scope, ['lefthook.yml', 'lefthook.yaml'])
  const packageJsonFiles = expandRoot(scope, ['package.json'])
  // Meta: sibling projects + meta root (meta has pulumi/ too)
  const gitignoreFiles =
    scope === 'project'
      ? ['.gitignore']
      : ['*/.gitignore', '.gitignore']

  return [
    ...eslintPluginJsonSchemaValidator.configs.base,
    {
      files: inventoryFiles,
      rules: schemaRule([
        {
          fileMatch: expandRoot(scope, ['project.json']),
          schema: schemas.projectProject,
        },
        {
          fileMatch: expandRoot(scope, ['package.json']),
          schema: schemas.projectPackage,
        },
        {
          fileMatch: expandRoot(scope, ['.cursor/worktrees.json']),
          schema: schemas.projectWorktrees,
        },
      ]),
    },
    {
      files: packageJsonFiles,
      plugins: {
        'project-harness': projectHarnessPlugin,
      },
      rules: {
        'project-harness/inventory': 'error',
      },
    },
    {
      files: repoHarnessFiles,
      rules: schemaRule([
        {
          fileMatch: repoHarnessFiles,
          schema: schemas.projectRepoHarness,
        },
      ]),
    },
    {
      files: envHarnessFiles,
      rules: schemaRule([
        {
          fileMatch: envHarnessFiles,
          schema: schemas.projectEnvHarness,
        },
      ]),
    },
    {
      files: pulumiHarnessFiles,
      rules: schemaRule([
        {
          fileMatch: pulumiHarnessFiles,
          schema: schemas.projectPulumiHarness,
        },
      ]),
    },
    {
      files: tsconfigFiles,
      rules: schemaRule([
        {
          fileMatch: tsconfigFiles,
          schema: schemas.projectTsconfig,
        },
      ]),
    },
    {
      files: releasercFiles,
      rules: schemaRule([
        {
          fileMatch: releasercFiles,
          schema: schemas.projectReleaserc,
        },
      ]),
    },
    {
      files: playwrightConfigFiles,
      plugins: {
        'project-harness': projectHarnessPlugin,
      },
      processor: 'project-harness/playwright-config',
      rules: {
        'project-harness/playwright-config': 'error',
      },
    },
    {
      files: workflowFiles,
      plugins: {
        'project-harness': projectHarnessPlugin,
      },
      rules: {
        ...schemaRule([
          {
            fileMatch: workflowFiles,
            schema: schemas.projectWorkflowOnPushMain,
          },
        ]),
        'project-harness/workflow-no-npm-token': 'error',
      },
    },
    {
      files: lefthookFiles,
      rules: schemaRule([
        {
          fileMatch: lefthookFiles,
          schema: schemas.projectLefthook,
        },
      ]),
    },
    {
      files: gitignoreFiles,
      plugins: {
        'project-harness': projectHarnessPlugin,
      },
      processor: 'project-harness/gitignore',
      rules: {
        'project-harness/pulumi-gitignore': 'error',
      },
    },
  ]
}
