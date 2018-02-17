// @flow
import {combineReducers} from 'redux'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import {createActivityReducerForResource} from './createActivityReducerForResource'

/**
 * Creates a combined loading reducer for a list of resources.
 * The result is usually plugged under `resourcesActivity`
 */
export function createActivityReducersForResources(
  resources: ResourceDefinition[]
) {
  const reducers = {}

  resources.forEach(
    resource =>
      (reducers[resource.name] = createActivityReducerForResource(resource))
  )

  return combineReducers(reducers)
}
