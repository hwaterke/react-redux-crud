// @flow
import {applyMiddleware, combineReducers, createStore} from 'redux'
import thunk from 'redux-thunk'
import {createActivityReducersForResources} from '../src/reducers/createActivityReducersForResources'
import {createReducersForResources} from '../src/reducers/createReducersForResources'
import type {ResourceDefinition} from '../src/types/ResourceDefinition'

export const Book: ResourceDefinition = {
  name: 'books',
  key: 'uuid',
  defaultPath: 'books',

  propTypes: {},
}

const lastActionReducer = (state = null, action) => {
  return action
}

export const initialiseStore = () => {
  const reducer = combineReducers({
    resources: createReducersForResources([Book]),
    resourcesActivity: createActivityReducersForResources([Book]),

    lastAction: lastActionReducer,
  })

  return createStore(reducer, applyMiddleware(thunk))
}
