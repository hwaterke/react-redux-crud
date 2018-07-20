[![Build Status](https://travis-ci.org/hwaterke/redux-crud-provider.svg?branch=master)](https://travis-ci.org/hwaterke/redux-crud-provider)

# redux-crud-provider

This library is designed to store entities in redux and handles CRUD operations with a backend.
It relies on `redux-crud` for handling redux and adds specific actions to create, read, update and delete entities on a backend.

# How to

## Define your entities

First, you need to define the entities used in your application.

The type of a ResourceDefinition can be found [here](src/types/ResourceDefinition.js).

Examples of ResourceDefinition can be found [here](example/src/resources/resources.js).

## Setup reducers

The library provides you with two reducers in order to keep track of the different entities of your application and the network activity.

```js
createReducersForResources(entityDefinitions)
createActivityReducersForResources(entityDefinitions)
```

See an example of the redux setup [here](example/src/reducers/reducers.js).

## Selecting the entities from redux

To access the entities in your application, the library provides you with two selectors.

```js
select(myResourceDefinition).asArray
select(myResourceDefinition).byId
```

Those can be used in your `mapStateToProps` like this:

```js
import {select} from 'redux-crud-provider'

const mapStateToProps = state => ({
  books: select(BookResource).asArray(state),
  authorsById: select(AuthorResource).byId(state),
})
```

## Setup the CRUD thunks

This library relies on `redux-thunk` in order to dispatch actions that will trigger backend calls.
Make sure you have `redux-thunk` configured as a redux middleware in your application.

In order to update the entities in redux through backend calls, you need to create thunks.

```js
const crudThunks = createCrudThunks(config)
```

The config needs to have this [type](src/thunks/createCrudThunks.js#L14).
See an example [here](example/src/thunks/crudThunks.js).

The `createCrudThunks` function will return an object with the following action creators:

### Fetch all

```js
crudThunks.fetchAll({resource, path, replace = false, params})
```

**Parameters**

| Name     | Type               | Required | Description                                                                                                                                                      |
| -------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resource | ResourceDefinition | yes      | The resource that will be fetched                                                                                                                                |
| path     | string             |          | An optional path to use to fetch the resources. `resource.defaultPath` is used by default                                                                        |
| replace  | boolean            |          | If true, all entities in redux will be dropped and replaced with the result from the backend. If false, entities retrieved will be merged with the existing one. |
| params   | object             |          | An optional object containing query params for the call                                                                                                          |

### Fetch one

```js
crudThunks.fetchOne({resource, path, uuid, params})
```

**Parameters**

| Name     | Type               | Required | Description                                                                                         |
| -------- | ------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| resource | ResourceDefinition | yes      | The resource that will be fetched                                                                   |
| path     | string             |          | An optional path to use to fetch the resource. `${resource.defaultPath}/${uuid}` is used by default |
| uuid     | string             | yes      | The uuid of the entity that needs to be fetched                                                     |
| params   | object             |          | An optional object containing query params for the call                                             |

### Create

```js
crudThunks.createResource({resource, path, entity})
```

**Parameters**

| Name     | Type               | Required | Description                                                                                 |
| -------- | ------------------ | -------- | ------------------------------------------------------------------------------------------- |
| resource | ResourceDefinition | yes      | The resource that will be created                                                           |
| path     | string             |          | An optional path to use to fetch the resource. `${resource.defaultPath}` is used by default |
| entity   | object             | yes      | An object containing the properties that will be sent to the backend                        |

### Update

```js
crudThunks.updateResource({resource, path, merge = true, entity})
```

**Parameters**

| Name     | Type               | Required | Description                                                                                                         |
| -------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| resource | ResourceDefinition | yes      | The resource that will be updated                                                                                   |
| path     | string             |          | An optional path to use to fetch the resource. `${resource.defaultPath}/${entity[resource.key]}` is used by default |
| merge    | boolean            |          | Whether or not to merge the `entity` provided with the existing entity in redux for the optimistic update           |
| entity   | object             | yes      | An object containing the properties that will be sent to the backend                                                |

### Delete

```js
crudThunks.deleteResource({resource, path, entity})
```

**Parameters**

| Name     | Type               | Required | Description                                                                                                         |
| -------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| resource | ResourceDefinition | yes      | The resource that will be deleted                                                                                   |
| path     | string             |          | An optional path to use to fetch the resource. `${resource.defaultPath}/${entity[resource.key]}` is used by default |
| entity   | object             | yes      | An object containing the properties that will be sent to the backend                                                |

## Providers

Often, you won't need to use the thunks directly.
Instead, the library provides you with react components that dispatch those actions for you.

### ResourceListProvider

Example:

```js
<ResourceListProvider crudThunks={crudThunks} resource={BookResource}>
  {({entities}) => (
    <ul>{entities.map(book => <li key={book.id}>{book.name}</li>)}</ul>
  )}
</ResourceListProvider>
```

**Props**

| Name            | Type               | Required | Description                                                               |
| --------------- | ------------------ | -------- | ------------------------------------------------------------------------- |
| `children`      | function           | yes      | Render prop, see description below                                        |
| `resource`      | ResourceDefinition | yes      | The resource to use                                                       |
| `path`          | string             |          | Passed to `crudThunks.fetchAll`                                           |
| `replace`       | boolean            |          | Passed to `crudThunks.fetchAll`                                           |
| `params`        | object             |          | Passed to `crudThunks.fetchAll`                                           |
| `autoFetch`     | boolean            |          | Triggers a call do the backend automatically to refresh the data in redux |
| `loadingRender` | React Element      |          | A react element to render while data are being fetched                    |
| `crudThunks`    | object             | yes      | The result of createCrudThunks                                            |

**Children function**

The children function will be called with an object with the following properties:

| Name       | Type     | Description                                         |
| ---------- | -------- | --------------------------------------------------- |
| `entities` | array    | The list of entities                                |
| `fetchAll` | function | A function to trigger a fetch from the backend      |
| `loading`  | boolean  | `true` when there is an ongoing call to the backend |

### ResourceProvider

Example:

```js
<ResourceProvider
  crudThunks={crudThunks}
  resource={Book}
  uuid={match.params.uuid}
>
  {({entity}) => <h1>{entity.name}</h1>}
</ResourceProvider>
```

**Props**

| Name            | Type               | Required | Description                                                                                  |
| --------------- | ------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `children`      | function           | yes      | Render prop, see description below                                                           |
| `resource`      | ResourceDefinition | yes      | The resource to use                                                                          |
| `uuid`          | string             | yes      | The uuid of the entity to manage                                                             |
| `path`          | string             |          | Passed to `crudThunks.fetchOne`, `crudThunks.updateResource` and `crudThunks.deleteResource` |
| `params`        | object             |          | Passed to `crudThunks.fetchOne`                                                              |
| `autoFetch`     | boolean            |          | Triggers a call do the backend automatically to refresh the data in redux                    |
| `loadingRender` | React Element      |          | A react element to render while data are being fetched                                       |
| `crudThunks`    | object             | yes      | The result of createCrudThunks                                                               |
| `postAction`    | function           |          | A function called after a successful update or delete                                        |

**Children function**

The children function will be called with an object with the following properties:

| Name                    | Type     | Description                                            |
| ----------------------- | -------- | ------------------------------------------------------ |
| `entity`                | any      | The entity                                             |
| `fetchEntity`           | function | A function to re-fetch the entity from the backend     |
| `updateEntity`          | function | A function to update the entity (calls the backend)    |
| `deleteEntity`          | function | A function to delete the entity (calls the backend)    |
| `thunks.fetchOne`       | function | The `fetchOne` thunk already bound to `dispatch`       |
| `thunks.updateResource` | function | The `updateResource` thunk already bound to `dispatch` |
| `thunks.deleteResource` | function | The `deleteResource` thunk already bound to `dispatch` |
| `isFetching`            | boolean  | True when the entity is being fetched                  |
| `isUpdating`            | boolean  | True when the entity is being updated                  |
| `isRemoving`            | boolean  | True when the entity is being deleted                  |

# Peer dependencies

- `axios`
- `react`
- `react-redux`
- `redux`
- `reselect`

`yarn add axios react redux react-redux reselect`
