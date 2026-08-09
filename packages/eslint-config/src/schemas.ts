import { createRequire } from 'node:module'

const requireJson = createRequire(import.meta.url)

const appPlaywrightExtapp = requireJson('./schemas/app__playwright-extapp.json')
const appPlaywrightWebapp = requireJson('./schemas/app__playwright-webapp.json')
const projectPackage = requireJson('./schemas/project__package.json')
const projectProject = requireJson('./schemas/project__project.json')
const projectWorkflowOnPushMain = requireJson(
  './schemas/project__workflow-on-push-main.json',
)
const projectWorktrees = requireJson('./schemas/project__worktrees.json')
const projectRepoHarness = requireJson('./schemas/project__repo-harness.json')
const projectEnvHarness = requireJson('./schemas/project__env-harness.json')
const projectPulumiHarness = requireJson(
  './schemas/project__pulumi-harness.json',
)
const projectTsconfig = requireJson('./schemas/project__tsconfig.json')
const projectReleaserc = requireJson('./schemas/project__releaserc.json')

export const schemas = {
  projectProject,
  projectPackage,
  projectWorktrees,
  projectWorkflowOnPushMain,
  projectRepoHarness,
  projectEnvHarness,
  projectPulumiHarness,
  projectTsconfig,
  projectReleaserc,
  appPlaywrightWebapp,
  appPlaywrightExtapp,
} as const
