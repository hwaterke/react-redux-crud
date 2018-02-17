// @flow
import reduxCrud from 'redux-crud/dist/index'
import {Book, initialiseStore} from './utils'

describe('Reducers', () => {
  let store

  beforeEach(() => {
    store = initialiseStore()
  })

  test('should have a correct initial state', function() {
    const state = store.getState()
    expect(state).toMatchSnapshot()
  })

  test('should have a correct state after FETCH_START', function() {
    const actionTypes = reduxCrud.actionTypesFor(Book.name)
    store.dispatch({type: actionTypes.fetchStart})

    expect(store.getState()).toMatchSnapshot()
  })

  test('should have a correct state after FETCH_SUCCESS', function() {
    const actionTypes = reduxCrud.actionTypesFor(Book.name)
    store.dispatch({type: actionTypes.fetchStart})
    store.dispatch({
      type: actionTypes.fetchSuccess,
      records: [{uuid: 1, name: 'Name'}],
    })

    expect(store.getState()).toMatchSnapshot()
  })
})
