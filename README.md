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

## Setup the CRUD thunks

This library relies on `redux-thunk` in order to dispatch actions that will trigger backend calls.
Make sure you have `redux-thunk` configured as a redux middleware in your application.

```js
const crudThunks = createCrudThunks(config)
```

The config needs to have this [type](src/thunks/createCrudThunks.js#L14).
See an example [here](example/src/thunks/crudThunks.js).

The `createCrudThunks` function will return an object with the following action creators:

```js
const crudThunks = {
  fetchAll: ({resource, path, replace = false, params}) => {},

  fetchOne: ({resource, path, uuid, params}) => {},

  createResource: ({resource, path, entity}) => {},

  updateResource: ({resource, path, merge = true, entity}) => {},

  deleteResource: ({resource, path, entity}) => {},
}
```

# Peer dependencies

- `axios`
- `react`
- `react-redux`
- `redux`
- `reselect`

`yarn add axios react redux react-redux reselect`
