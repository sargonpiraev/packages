declare module 'eslint-plugin-json-schema-validator' {
  import type { Linter } from 'eslint'

  const eslintPluginJsonSchemaValidator: {
    configs: {
      base: Linter.Config[]
    }
  }

  export default eslintPluginJsonSchemaValidator
}
