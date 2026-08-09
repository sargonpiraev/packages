import { createProjectConfigs } from './create-project-configs.js'

/** Flat-config preset for meta-repo sibling project globs (e.g. star/project.json). */
const projectMeta = createProjectConfigs({ scope: 'meta' })

export default projectMeta
