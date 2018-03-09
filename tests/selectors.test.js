// @flow
import reduxCrud from 'redux-crud/dist/index'
import {select} from '../src/selectors/select'
import {Book, initialiseStore} from './utils'

describe('Selectors', () => {
  let store

  beforeEach(() => {
    store = initialiseStore()
  })

  describe('Resources', () => {
    describe('byId', () => {
      test('should have a correct initial state', function() {
        const state = select(Book).byId(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_START', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})

        const state = select(Book).byId(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_SUCCESS', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})
        store.dispatch({
          type: actionTypes.fetchSuccess,
          records: [{uuid: 1, name: 'Name'}],
        })

        const state = select(Book).byId(store.getState())
        expect(state).toMatchSnapshot()
      })
    })

    describe('asArray', () => {
      test('should have a correct initial state', function() {
        const state = select(Book).asArray(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_START', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})

        const state = select(Book).asArray(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_SUCCESS', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})
        store.dispatch({
          type: actionTypes.fetchSuccess,
          records: [{uuid: 1, name: 'Name'}],
        })

        const state = select(Book).asArray(store.getState())
        expect(state).toMatchSnapshot()
      })
    })
  })

  describe('Activity', () => {
    test('should have a correct initial state', function() {
      const state = select(Book).activity.all(store.getState())
      expect(state).toMatchSnapshot()
    })

    test('should have a correct state after FETCH_START', function() {
      const actionTypes = reduxCrud.actionTypesFor(Book.name)
      store.dispatch({type: actionTypes.fetchStart})

      const state = select(Book).activity.all(store.getState())
      expect(state).toMatchSnapshot()
    })

    test('should have a correct state after FETCH_SUCCESS', function() {
      const actionTypes = reduxCrud.actionTypesFor(Book.name)
      store.dispatch({type: actionTypes.fetchStart})
      store.dispatch({
        type: actionTypes.fetchSuccess,
        records: [{uuid: 1, name: 'Name'}],
      })

      const state = select(Book).activity.all(store.getState())
      expect(state).toMatchSnapshot()
    })
  })
})
