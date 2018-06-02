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

// Providers
export {ResourceCreator} from './providers/ResourceCreator'
export {ResourceListProvider} from './providers/ResourceListProvider'
export {ResourceProvider} from './providers/ResourceProvider'

// Types
export type {ResourceDefinition} from './types/ResourceDefinition'
