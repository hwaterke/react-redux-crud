// @flow
import reduxCrud from 'redux-crud/dist/index'
import type {ActivityResourceSelector} from '../src/selectors/createResourceActivitySelector'
import {createResourceActivitySelector} from '../src/selectors/createResourceActivitySelector'
import {createResourceSelectors} from '../src/selectors/createResourceSelectors'
import {Book, initialiseStore} from './utils'

describe('Selectors', () => {
  let store

  beforeEach(() => {
    store = initialiseStore()
  })

  describe('Resources', () => {
    let selector

    beforeEach(() => {
      selector = createResourceSelectors(state => state.resources)
    })

    describe('byId', () => {
      test('should have a correct initial state', function() {
        const state = selector.byId(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_START', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})

        const state = selector.byId(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_SUCCESS', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})
        store.dispatch({
          type: actionTypes.fetchSuccess,
          records: [{uuid: 1, name: 'Name'}],
        })

        const state = selector.byId(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })
    })

    describe('asArray', () => {
      test('should have a correct initial state', function() {
        const state = selector.asArray(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_START', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})

        const state = selector.asArray(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })

      test('should have a correct state after FETCH_SUCCESS', function() {
        const actionTypes = reduxCrud.actionTypesFor(Book.name)
        store.dispatch({type: actionTypes.fetchStart})
        store.dispatch({
          type: actionTypes.fetchSuccess,
          records: [{uuid: 1, name: 'Name'}],
        })

        const state = selector.asArray(Book)(store.getState())
        expect(state).toMatchSnapshot()
      })
    })
  })

  describe('Activity', () => {
    let selector: ActivityResourceSelector

    beforeEach(() => {
      selector = createResourceActivitySelector(state => state.activity)
    })

    test('should have a correct initial state', function() {
      const state = selector(Book)(store.getState())
      expect(state).toMatchSnapshot()
    })

    test('should have a correct state after FETCH_START', function() {
      const actionTypes = reduxCrud.actionTypesFor(Book.name)
      store.dispatch({type: actionTypes.fetchStart})

      const state = selector(Book)(store.getState())
      expect(state).toMatchSnapshot()
    })

    test('should have a correct state after FETCH_SUCCESS', function() {
      const actionTypes = reduxCrud.actionTypesFor(Book.name)
      store.dispatch({type: actionTypes.fetchStart})
      store.dispatch({
        type: actionTypes.fetchSuccess,
        records: [{uuid: 1, name: 'Name'}],
      })

      const state = selector(Book)(store.getState())
      expect(state).toMatchSnapshot()
    })
  })
})
