// @flow
import reduxCrud from 'redux-crud'
import type {Action} from '../types/Action'
import type {ResourceDefinition} from '../types/ResourceDefinition'

export type ActivityState = {
  activity: number,
  fetch: number,
  create: number,
  update: number,
  remove: number,
}

const initialState: ActivityState = {
  activity: 0,
  fetch: 0,
  create: 0,
  update: 0,
  remove: 0,
}

function incActivity(state: ActivityState, name): ActivityState {
  return {...state, activity: state.activity + 1, [name]: state[name] + 1}
}

function decActivity(state: ActivityState, name): ActivityState {
  return {...state, activity: state.activity - 1, [name]: state[name] - 1}
}

export function createActivityReducerForResource(resource: ResourceDefinition) {
  const actionTypes = reduxCrud.actionTypesFor(resource.name)

  return (state: ActivityState = initialState, action: Action) => {
    switch (action.type) {
      case actionTypes.fetchStart:
        return incActivity(state, 'fetch')
      case actionTypes.fetchSuccess:
      case actionTypes.fetchError:
        return decActivity(state, 'fetch')

      case actionTypes.createStart:
        return incActivity(state, 'create')
      case actionTypes.createSuccess:
      case actionTypes.createError:
        return decActivity(state, 'create')

      case actionTypes.updateStart:
        return incActivity(state, 'update')
      case actionTypes.updateSuccess:
      case actionTypes.updateError:
        return decActivity(state, 'update')

      case actionTypes.deleteStart:
        return incActivity(state, 'remove')
      case actionTypes.deleteSuccess:
      case actionTypes.deleteError:
        return decActivity(state, 'remove')

      default:
        return state
    }
  }
}
