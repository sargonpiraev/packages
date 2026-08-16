/** Canonical `apps/*` directory names (see meta `.cursor/rules/apps/*.mdc`). */
export const CANONICAL_APP_NAMES = [
  'webapp',
  'docapp',
  'extapp',
  'admapp',
  'jobapp',
  'wuiapp',
  'muiapp',
  'mobapp',
  'vidapp',
  'imgapp',
  'pgboss',
  'studio',
] as const

export type CanonicalAppName = (typeof CANONICAL_APP_NAMES)[number]

/** Legacy / forbidden app directory names under `apps/`. */
export const FORBIDDEN_APP_NAMES = [
  'web',
  'docs',
  'example',
  'mobile',
  'app',
  'admin',
  'jobs',
  'storybook',
] as const

/** Apps that must ship `.env.example` (names only; no secrets). */
export const ENV_CONTRACT_APP_NAMES = [
  'webapp',
  'docapp',
  'extapp',
  'mobapp',
  'jobapp',
  'admapp',
] as const

export const PRETTIER_CONFIG_PACKAGE = '@sargonpiraev/prettier-config'
export const TSCONFIG_PACKAGE_PREFIX = '@sargonpiraev/tsconfig'
export const COMMITLINT_CONFIG_PACKAGE = '@sargonpiraev/commitlint-config'
export const ESLINT_CONFIG_PACKAGE = '@sargonpiraev/eslint-config'
