// @flow
import reduxCrud from 'redux-crud'
import axios from 'axios'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import {invariant} from '../utils/utils'

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
    fetchAll: (
      resource: ResourceDefinition,
      path: string,
      replace: boolean = false
    ) => (dispatch: Function, getState: Function) => {
      invariant(
        path,
        'You need to specify a path as second parameter to fetch one record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.fetchStart())

      const promise = axios({
        url: `${config.backendSelector(getState())}/${path}`,
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

    fetchOne: (resource: ResourceDefinition, path: string, uuid: string) => (
      dispatch: Function,
      getState: Function
    ) => {
      invariant(
        path,
        'You need to specify a path as second parameter to fetch one record'
      )
      invariant(
        uuid,
        'You need to specify a uuid as third parameter to fetch one record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.fetchStart())

      const promise = axios({
        url: `${config.backendSelector(getState())}/${path}/${uuid}`,
        method: 'get',
        headers: config.headersSelector(getState()),
      })

      promise
        .then(
          response => {
            dispatch(
              baseActionCreators.fetchSuccess(
                config.fetchOneDataToRecord(response.data)
              )
            )
          },
          error => {
            dispatch(baseActionCreators.fetchError(dataOrError(error)))
            config.onError(resource, 'fetchOne', error, dispatch)
          }
        )
        .catch(err => {
          config.onError(resource, 'fetchOne', err, dispatch)
        })

      return promise
    },

    createResource: (
      resource: ResourceDefinition,
      path: string,
      entity: any
    ) => (dispatch: Function, getState: Function) => {
      invariant(
        path,
        'You need to specify a path as second parameter to create a record'
      )
      invariant(
        entity,
        'You need to specify an entity as third parameter to create a record'
      )

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
        url: `${config.backendSelector(getState())}/${path}`,
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

    updateResource: (
      resource: ResourceDefinition,
      path: string,
      entity: any
    ) => (dispatch: Function, getState: Function) => {
      invariant(
        path,
        'You need to specify a path as second parameter to update a record'
      )
      invariant(
        entity,
        'You need to specify an entity as third parameter to update a record'
      )
      invariant(
        entity[resource.key],
        'The entity needs to have a key to update a record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.updateStart(entity))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${path}/${
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

    deleteResource: (
      resource: ResourceDefinition,
      path: string,
      entity: any
    ) => (dispatch: Function, getState: Function) => {
      invariant(
        path,
        'You need to specify a path as second parameter to delete a record'
      )
      invariant(
        entity,
        'You need to specify an entity as third parameter to delete a record'
      )
      invariant(
        entity[resource.key],
        'The entity needs to have a key to delete a record'
      )

      const baseActionCreators = reduxCrud.actionCreatorsFor(resource.name, {
        key: resource.key,
      })

      dispatch(baseActionCreators.deleteStart(entity))

      const promise = axios({
        url: `${config.backendSelector(getState())}/${path}/${
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
