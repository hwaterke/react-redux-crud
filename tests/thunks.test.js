import {createCrudThunks} from '../src/thunks/createCrudThunks'
import {Book, crudConfig, initialiseStore} from './utils'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('Thunks', () => {
  let store
  const axiosMock = new MockAdapter(axios)

  beforeEach(() => {
    store = initialiseStore()
    axiosMock.reset()
  })

  describe('fetchAll', () => {
    it('should fetch records', async () => {
      axiosMock.onGet('/books').reply(200, [{uuid: 1, name: 'A book'}])
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      expect(store.getState()).toMatchSnapshot()
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
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      await store.dispatch(thunks.fetchAll(Book, 'books2'))
      expect(store.getState()).toMatchSnapshot()
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
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      await store.dispatch(thunks.fetchAll(Book, 'books2', true))
      expect(store.getState()).toMatchSnapshot()
    })

    it('should add custom headers', async () => {
      axiosMock.onGet('/books').reply(config => {
        return [200, [{uuid: 1, token: config.headers.Authorization}]]
      })

      const thunks = createCrudThunks({
        ...crudConfig,
        headersSelector: () => ({Authorization: '123'}),
      })
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      expect(store.getState()).toMatchSnapshot()
    })

    it('should handle errors', async () => {
      axiosMock.onGet('/books').networkError()

      const thunks = createCrudThunks(crudConfig)

      expect.assertions(1)
      try {
        await store.dispatch(thunks.fetchAll(Book, 'books'))
      } catch (e) {
        expect(e.message).toBe('Network Error')
      }
    })
  })

  describe('fetchOne', () => {
    it('should fetch one record', async () => {
      axiosMock.onGet('/books/123').reply(200, {uuid: 123, name: 'A book'})
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchOne(Book, 'books', '123'))
      expect(store.getState()).toMatchSnapshot()
    })

    it('should merge one record', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 2, name: 'Another book'},
        ])
      axiosMock.onGet('/books/2').reply(200, {uuid: 2, name: 'A second book'})
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      await store.dispatch(thunks.fetchOne(Book, 'books', '2'))
      expect(store.getState()).toMatchSnapshot()
    })
  })

  describe('createResource', () => {
    it('should create a record', async () => {
      axiosMock.onPost('/books').reply(201, {uuid: 1, name: 'A book'})
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(
        thunks.createResource(Book, 'books', {name: 'A book'})
      )
      expect(store.getState()).toMatchSnapshot()
    })
  })

  describe('updateResource', () => {
    it('should update a record', async () => {
      axiosMock.onPatch('/books/123').reply(200, {uuid: 123, name: 'A book'})
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(
        thunks.updateResource(Book, 'books', {uuid: 123, name: 'A book'})
      )
      expect(store.getState()).toMatchSnapshot()
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
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      await store.dispatch(
        thunks.updateResource(Book, 'books', {
          uuid: 123,
          name: 'An updated book',
        })
      )
      expect(store.getState()).toMatchSnapshot()
    })
  })

  describe('deleteResource', () => {
    it('should delete a record', async () => {
      axiosMock.onDelete('/books/123').reply(204)
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.deleteResource(Book, 'books', {uuid: 123}))
      expect(store.getState()).toMatchSnapshot()
    })

    it('should delete an existing record', async () => {
      axiosMock
        .onGet('/books')
        .reply(200, [
          {uuid: 1, name: 'A book'},
          {uuid: 123, name: 'Another book'},
        ])
      axiosMock.onDelete('/books/123').reply(204)
      const thunks = createCrudThunks(crudConfig)
      await store.dispatch(thunks.fetchAll(Book, 'books'))
      await store.dispatch(thunks.deleteResource(Book, 'books', {uuid: 123}))
      expect(store.getState()).toMatchSnapshot()
    })
  })
})
