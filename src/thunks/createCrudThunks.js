// @flow
import reduxCrud from 'redux-crud'
import axios from 'axios'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import {invariant, requiredParam} from '../utils/utils'

function dataOrError(error) {
  if (error.response && error.response.data) {
    return error.response.data
  }
  return error
}

export type CrudConfig = {
  /**
   * An optional function that returns the base url of the backend.
   * First argument is the redux state.
   * Default is an empty string
   */
  backendSelector?: (state: any) => string,

  /**
   * An optional function that returns headers to use in every request.
   * First argument is the redux state.
   * Default is an empty object
   * This can be used to add an Authorization token which is stored in redux.
   */
  headersSelector?: (state: any) => {[headerName: string]: string},

  /**
   * This optional function is called whenever an error occurs.
   */
  onError?: (
    resource: ResourceDefinition,
    operation: string,
    error: any,
    dispatch: Function
  ) => void,

  /**
   * This mandatory function is used to generated a unique id for a entity being created.
   * This is used for optimistic creation
   */
  cuid: () => string,

  /**
   * This optional function is used to select the record array from a fetchAll response from the backend.
   * The first parameter is the body of the response.
   * The default implementation is the identity function
   */
  fetchAllDataToRecords?: (responseData: any) => any[],

  /**
   * This optional function is used to select the record from a fetchOne response from the backend.
   * The first parameter is the body of the response.
   * The default implementation is the identity function
   */
  fetchOneDataToRecord?: (responseData: any) => any,

  /**
   * This optional function is used to select the record from a create response from the backend.
   * The first parameter is the body of the response.
   * The default implementation is the identity function
   */
  createDataToRecord?: (responseData: any) => any,

  /**
   * This optional function is used to select the record from an update response from the backend.
   * The first parameter is the body of the response.
   * The default implementation is the identity function
   */
  updateDataToRecord?: (responseData: any) => any,
}

const defaultConfiguration = {
  backendSelector: (state: any) => '',
  headersSelector: (state: any) => ({}),
  onError: (
    resource: ResourceDefinition,
    operation: string,
    error: any,
    dispatch: Function
  ) => {},
  fetchAllDataToRecords: data => data,
  fetchOneDataToRecord: data => data,
  createDataToRecord: data => data,
  updateDataToRecord: data => data,
}

export function createCrudThunks(configuration: CrudConfig) {
  const config = {
    ...defaultConfiguration,
    ...configuration,
  }

  invariant(
    config.cuid,
    'You need to specify a cuid function in your CRUD configuration'
  )

  return {
    fetchAll: ({
      resource = requiredParam('resource'),
      path,
      replace = false,
      params,
    }: {
      resource: ResourceDefinition,
      path?: string,
      replace?: boolean,
      params?: {[string]: string},
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath = path || resource.defaultPath

      invariant(resourcePath, 'You need to specify a path to fetch records')

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.fetchStart())

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}`,
        method: 'get',
        headers: config.headersSelector(getState()),
        params,
      })

      promise
        .then(
          response => {
            dispatch(
              baseActionCreators.fetchSuccess(
                config.fetchAllDataToRecords(response.data),
                {replace}
              )
            )
          },
          error => {
            dispatch(baseActionCreators.fetchError(dataOrError(error)))
            config.onError(resource, 'fetchAll', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'fetchAll', err, dispatch)
        })

      return promise
    },

    fetchOne: ({
      resource = requiredParam('resource'),
      path,
      uuid = requiredParam('uuid'),
      params,
    }: {
      resource: ResourceDefinition,
      path?: string,
      uuid: string,
      params?: {[string]: string},
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath =
        path ||
        (resource.defaultPath ? `${resource.defaultPath}/${uuid}` : null)
      invariant(resourcePath, 'You need to specify a path to fetch a record')

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.fetchStart({fetchOne: uuid}))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}`,
        method: 'get',
        headers: config.headersSelector(getState()),
        params,
      })

      promise
        .then(
          response => {
            dispatch(
              baseActionCreators.fetchSuccess(
                config.fetchOneDataToRecord(response.data),
                {fetchOne: uuid}
              )
            )
          },
          error => {
            dispatch(
              baseActionCreators.fetchError(dataOrError(error), {
                fetchOne: uuid,
              })
            )
            config.onError(resource, 'fetchOne', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'fetchOne', err, dispatch)
        })

      return promise
    },

    createResource: ({
      resource = requiredParam('resource'),
      path,
      entity = requiredParam('entity'),
      optimistic = true,
    }: {
      resource: ResourceDefinition,
      path?: string,
      entity: any,
      optimistic: boolean,
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath = path || resource.defaultPath
      invariant(resourcePath, 'You need to specify a path to create a record')

      // Create a client id
      const cid = entity[resource.key] || config.cuid()
      if (!entity[resource.key]) {
        entity = {...entity, [resource.key]: cid}
      }

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      if (optimistic) {
        dispatch(baseActionCreators.createStart(entity))
      }

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}`,
        method: 'post',
        headers: config.headersSelector(getState()),
        data: entity,
      })

      promise
        .then(
          response => {
            dispatch(
              baseActionCreators.createSuccess(
                config.createDataToRecord(response.data),
                cid
              )
            )
          },
          error => {
            dispatch(baseActionCreators.createError(dataOrError(error), entity))
            config.onError(resource, 'create', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'create', err, dispatch)
        })

      return promise
    },

    updateResource: ({
      resource = requiredParam('resource'),
      path,
      merge = true,
      entity = requiredParam('entity'),
      method = 'patch',
      body = null,
      optimistic = true,
    }: {
      resource: ResourceDefinition,
      path?: string,
      merge?: boolean,
      entity: any,
      method: string,
      body: any,
      optimistic: boolean,
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath =
        path ||
        (resource.defaultPath
          ? `${resource.defaultPath}/${entity[resource.key]}`
          : null)
      invariant(resourcePath, 'You need to specify a path to update a record')
      invariant(
        entity[resource.key],
        'The entity needs to have a key to update a record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      if (optimistic) {
        dispatch(baseActionCreators.updateStart(entity, {merge}))
      }

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}`,
        method,
        headers: config.headersSelector(getState()),
        data: body || entity,
      })

      promise
        .then(
          response => {
            dispatch(
              baseActionCreators.updateSuccess(
                config.updateDataToRecord(response.data)
              )
            )
          },
          error => {
            dispatch(baseActionCreators.updateError(dataOrError(error), entity))
            config.onError(resource, 'update', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'update', err, dispatch)
        })

      return promise
    },

    deleteResource: ({
      resource = requiredParam('resource'),
      path,
      entity = requiredParam('entity'),
    }: {
      resource: ResourceDefinition,
      path?: string,
      entity: any,
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath =
        path ||
        (resource.defaultPath
          ? `${resource.defaultPath}/${entity[resource.key]}`
          : null)
      invariant(resourcePath, 'You need to specify a path to delete a record')
      invariant(
        entity[resource.key],
        'The entity needs to have a key to delete a record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.deleteStart(entity))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}`,
        method: 'delete',
        headers: config.headersSelector(getState()),
      })

      promise
        .then(
          () => {
            dispatch(baseActionCreators.deleteSuccess(entity))
          },
          error => {
            dispatch(baseActionCreators.deleteError(dataOrError(error), entity))
            config.onError(resource, 'delete', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'delete', err, dispatch)
        })

      return promise
    },
  }
}
