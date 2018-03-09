import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import type {CrudConfig} from '../src/thunks/createCrudThunks'
import {createCrudThunks} from '../src/thunks/createCrudThunks'
import {Book, initialiseStore} from './utils'

describe('Thunks', () => {
  let store
  let intermediaryStates

  let crudConfig: CrudConfig
  let thunks
  const axiosMock = new MockAdapter(axios)

  beforeEach(() => {
    intermediaryStates = []

    store = initialiseStore()
    store.subscribe(() => intermediaryStates.push(store.getState()))

    let nextCid = 0
    crudConfig = {
      cuid: () => `cid${nextCid++}`,
    }

    thunks = createCrudThunks(crudConfig)

    axiosMock.reset()
  })

  describe('fetchAll', () => {
    it('should fetch records', async () => {
      axiosMock.onGet('/books').reply(200, [{uuid: 1, name: 'A book'}])

      await store.dispatch(thunks.fetchAll({resource: Book}))

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should merge fetched records', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 2, name: 'Another book'},
        ])
      axiosMock
        .onGet('/books2')
        .reply(200, [
          {uuid: 2, name: 'A second book'},
          {uuid: 3, name: 'A third book'},
        ])

      await store.dispatch(thunks.fetchAll({resource: Book}))
      await store.dispatch(thunks.fetchAll({resource: Book, path: 'books2'}))

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should replace fetched records', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 2, name: 'Another book'},
        ])
      axiosMock
        .onGet('/books2')
        .reply(200, [
          {uuid: 2, name: 'A second book'},
          {uuid: 3, name: 'A third book'},
        ])

      await store.dispatch(thunks.fetchAll({resource: Book}))
      await store.dispatch(
        thunks.fetchAll({resource: Book, path: 'books2', replace: true})
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should add custom headers', async () => {
      axiosMock.onGet('/books').reply(config => {
        return [200, [{uuid: 1, token: config.headers.Authorization}]]
      })

      const headerThunks = createCrudThunks({
        ...crudConfig,
        headersSelector: () => ({Authorization: '123'}),
      })

      await store.dispatch(headerThunks.fetchAll({resource: Book}))

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock.onGet('/books').networkError()

      expect.assertions(4)
      try {
        await store.dispatch(thunks.fetchAll({resource: Book}))
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })
  })

  describe('fetchOne', () => {
    it('should fetch one record', async () => {
      axiosMock.onGet('/books/123').reply(200, {uuid: 123, name: 'A book'})

      await store.dispatch(thunks.fetchOne({resource: Book, uuid: '123'}))

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should merge one record', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 2, name: 'Another book'},
        ])
      axiosMock.onGet('/books/2').reply(200, {uuid: 2, name: 'A second book'})

      await store.dispatch(thunks.fetchAll({resource: Book}))
      await store.dispatch(thunks.fetchOne({resource: Book, uuid: '2'}))

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock.onGet('/books/2').networkError()

      expect.assertions(4)
      try {
        await store.dispatch(thunks.fetchOne({resource: Book, uuid: '2'}))
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })
  })

  describe('createResource', () => {
    it('should create a record', async () => {
      axiosMock.onPost('/books').reply(201, {uuid: 1, name: 'A book'})

      await store.dispatch(
        thunks.createResource({resource: Book, entity: {name: 'A book'}})
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock.onPost('/books').networkError()

      expect.assertions(4)
      try {
        await store.dispatch(
          thunks.createResource({resource: Book, entity: {name: 'A book'}})
        )
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })
  })

  describe('updateResource', () => {
    it('should update a record', async () => {
      axiosMock.onPatch('/books/123').reply(200, {uuid: 123, name: 'A book'})

      await store.dispatch(
        thunks.updateResource({
          resource: Book,
          entity: {uuid: 123, name: 'A book'},
        })
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should update an existing record', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 123, name: 'Another book'},
        ])
      axiosMock
        .onPatch('/books/123')
        .reply(200, {uuid: 123, name: 'An updated book'})

      await store.dispatch(thunks.fetchAll({resource: Book}))
      await store.dispatch(
        thunks.updateResource({
          resource: Book,
          entity: {
            uuid: 123,
            name: 'An updated book',
          },
        })
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 123, name: 'Another book'},
        ])
      axiosMock.onPatch('/books/123').networkError()

      expect.assertions(4)
      try {
        await store.dispatch(
          thunks.updateResource({
            resource: Book,
            entity: {
              uuid: 123,
              name: 'An updated book',
            },
          })
        )
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })
  })

  describe('deleteResource', () => {
    it('should delete a record', async () => {
      axiosMock.onDelete('/books/123').reply(204)

      await store.dispatch(
        thunks.deleteResource({resource: Book, entity: {uuid: 123}})
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should delete an existing record', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 123, name: 'Another book'},
        ])
      axiosMock.onDelete('/books/123').reply(204)

      await store.dispatch(thunks.fetchAll({resource: Book}))
      await store.dispatch(
        thunks.deleteResource({resource: Book, entity: {uuid: 123}})
      )

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 123, name: 'Another book'},
        ])
      axiosMock.onDelete('/books/123').networkError()

      expect.assertions(4)
      await store.dispatch(thunks.fetchAll({resource: Book}))
      try {
        await store.dispatch(
          thunks.deleteResource({resource: Book, entity: {uuid: 123}})
        )
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }

      expect(intermediaryStates.map(s => s.lastAction)).toMatchSnapshot()
      expect(
        intermediaryStates.map(s => s.resourcesActivity.books)
      ).toMatchSnapshot()
      expect(intermediaryStates.map(s => s.resources.books)).toMatchSnapshot()
    })
  })
})
