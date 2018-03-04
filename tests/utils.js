// @flow
import {applyMiddleware, combineReducers, createStore} from 'redux'
import thunk from 'redux-thunk'
import {createActivityReducersForResources} from '../src/reducers/createActivityReducersForResources'
import {createReducersForResources} from '../src/reducers/createReducersForResources'
import cuid from 'cuid'
import type {CrudConfig} from '../src/thunks/createCrudThunks'
import type {ResourceDefinition} from '../src/types/ResourceDefinition'

export const Book: ResourceDefinition = {
  name: 'books',
  key: 'uuid',
  propTypes: {},
}

export const Category: ResourceDefinition = {
  name: 'categories',
  key: 'uuid',
  propTypes: {},
}

export const initialiseStore = () => {
  const reducer = combineReducers({
    resources: createReducersForResources([Book, Category]),
    activity: createActivityReducersForResources([Book, Category]),
  })

  return createStore(reducer, applyMiddleware(thunk))
}

export const crudConfig: CrudConfig = {
  cuid: () => cuid(),
}
