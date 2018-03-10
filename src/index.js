// @flow
import config from '../package.json'

export const VERSION = config.version

// Reducers
export {
  createActivityReducersForResources,
} from './reducers/createActivityReducersForResources'
export {createReducersForResources} from './reducers/createReducersForResources'

// Selectors
export {select} from './selectors/select'

// Thunks
export {createCrudThunks} from './thunks/createCrudThunks'

// Types
export type {ResourceDefinition} from './types/ResourceDefinition'
