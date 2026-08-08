import { defaultPlugins } from '@hey-api/openapi-ts'

export default {
  input: './openapi-spec.yaml',
  output: './src/generated',
  client: '@hey-api/client-axios',
  types: { enums: 'javascript' },
}
