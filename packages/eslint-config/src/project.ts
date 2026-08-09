import { createProjectConfigs } from './create-project-configs.js'

/** Flat-config preset for a project / shared repo root. */
const project = createProjectConfigs({ scope: 'project' })

export default project
