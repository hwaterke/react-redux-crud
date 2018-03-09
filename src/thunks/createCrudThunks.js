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
  backendSelector?: (state: any) => string,
  headersSelector?: (state: any) => {[headerName: string]: string},
  onError?: (
    resource: ResourceDefinition,
    operation: string,
    error: any,
    dispatch: Function
  ) => void,
  cuid: () => string,
  fetchAllDataToRecords?: (responseData: any) => any[],
  fetchOneDataToRecord?: (responseData: any) => any,
  createDataToRecord?: (responseData: any) => any,
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
    }: {
      resource: ResourceDefinition,
      path?: string,
      replace?: boolean,
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
    }: {
      resource: ResourceDefinition,
      path?: string,
      uuid: string,
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath = path || resource.defaultPath
      invariant(resourcePath, 'You need to specify a path to fetch a record')

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.fetchStart({fetchOne: uuid}))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}/${uuid}`,
        method: 'get',
        headers: config.headersSelector(getState()),
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
    }: {
      resource: ResourceDefinition,
      path?: string,
      entity: any,
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

      dispatch(baseActionCreators.createStart(entity))

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
      entity = requiredParam('entity'),
    }: {
      resource: ResourceDefinition,
      path?: string,
      entity: any,
    }) => (dispatch: Function, getState: Function) => {
      const resourcePath = path || resource.defaultPath
      invariant(resourcePath, 'You need to specify a path to update a record')
      invariant(
        entity[resource.key],
        'The entity needs to have a key to update a record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.updateStart(entity))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${resourcePath}/${
          entity[resource.key]
        }`,
        method: 'patch',
        headers: config.headersSelector(getState()),
        data: entity,
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
      const resourcePath = path || resource.defaultPath
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
        url: `${config.backendSelector(getState())}/${resourcePath}/${
          entity[resource.key]
        }`,
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
