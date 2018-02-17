// @flow
import {combineReducers} from 'redux'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import {createReducerForResource} from './createReducerForResource'

/**
 * Creates a combined reducer for a list of resources.
 * The result is usually plugged under `resources`
 */
export function createReducersForResources(resources: ResourceDefinition[]) {
  const reducers = {}

  resources.forEach(
    resource => (reducers[resource.name] = createReducerForResource(resource))
  )

  return combineReducers(reducers)
}
