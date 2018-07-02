// @flow
import reduxCrud from 'redux-crud'
import {mergeDeepRight, path} from 'ramda'
import type {ResourceDefinition} from '../types/ResourceDefinition'

export function createReducerForResource(resource: ResourceDefinition) {
  const defaultReducer = reduxCrud.Map.reducersFor(resource.name, {
    key: resource.key,
  })
  const defaultActions = reduxCrud.actionTypesFor(resource.name)

  return (state, action) => {
    if (action.type === defaultActions.updateStart) {
      if (path(['data', 'merge'], action)) {
        const existingRecord = state[action.record[resource.key]]
        const mergedRecord = mergeDeepRight(existingRecord, action.record)
        const newAction = {...action, record: mergedRecord}
        return defaultReducer(state, newAction)
      }
    }

    return defaultReducer(state, action)
  }
}
