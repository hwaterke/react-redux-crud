// @flow
import {dissoc, path} from 'ramda'
import {combineReducers} from 'redux'
import reduxCrud from 'redux-crud'
import type {ResourceDefinition} from '../types/ResourceDefinition'

type Dictionary = {[string]: number}

const extractFetchOneUuid = path(['data', 'fetchOne'])

function createFetchAllReducer(actionTypes) {
  return (state = 0, action) => {
    const isFetchOne = extractFetchOneUuid(action) !== undefined

    switch (action.type) {
      case actionTypes.fetchStart:
        {
          if (!isFetchOne) {
            return state + 1
          }
        }
        break
      case actionTypes.fetchSuccess:
      case actionTypes.fetchError: {
        if (!isFetchOne) {
          return state - 1
        }
      }
    }
    return state
  }
}

function createUuidReducer(
  actionTypes,
  operation,
  startKeyExtractor,
  successKeyExtractor,
  errorKeyExtractor
) {
  return (state: Dictionary = {}, action) => {
    switch (action.type) {
      case actionTypes[`${operation}Start`]:
        {
          const key = startKeyExtractor(action)
          if (key) {
            return {...state, [key]: (state[key] || 0) + 1}
          }
        }
        break
      case actionTypes[`${operation}Success`]:
        {
          const key = successKeyExtractor(action)
          if (key) {
            if (state[key] === 1) {
              return dissoc(key, state)
            } else {
              return {...state, [key]: state[key] - 1}
            }
          }
        }
        break
      case actionTypes[`${operation}Error`]: {
        const key = errorKeyExtractor(action)
        if (key) {
          if (state[key] === 1) {
            return dissoc(key, state)
          } else {
            return {...state, [key]: state[key] - 1}
          }
        }
      }
    }

    return state
  }
}

export function createActivityReducerForResource(resource: ResourceDefinition) {
  const actionTypes = reduxCrud.actionTypesFor(resource.name)

  return combineReducers({
    fetchingAll: createFetchAllReducer(actionTypes),
    fetching: createUuidReducer(
      actionTypes,
      'fetch',
      extractFetchOneUuid,
      extractFetchOneUuid,
      extractFetchOneUuid
    ),
    creating: createUuidReducer(
      actionTypes,
      'create',
      action => action.record[resource.key],
      action => action.cid,
      action => action.record[resource.key]
    ),
    updating: createUuidReducer(
      actionTypes,
      'update',
      action => action.record[resource.key],
      action => action.record[resource.key],
      action => action.record[resource.key]
    ),
    removing: createUuidReducer(
      actionTypes,
      'delete',
      action => action.record[resource.key],
      action => action.record[resource.key],
      action => action.record[resource.key]
    ),
  })
}
