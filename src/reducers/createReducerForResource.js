// @flow
import reduxCrud from 'redux-crud'
import type {ResourceDefinition} from '../types/ResourceDefinition'

export function createReducerForResource(resource: ResourceDefinition) {
  return reduxCrud.Map.reducersFor(resource.name, {key: resource.key})
}
