// @flow
import {createSelector} from 'reselect'
import type {ResourceDefinition} from '../types/ResourceDefinition'

type Selectors = {
  byId: Function,
  asArray: Function,
  activity: {
    all: Function,
    totalFetching: Function,
    totalCreating: Function,
    totalUpdating: Function,
    totalRemoving: Function,
  },
}

const selectorsByResource = {}

export function select(resource: ResourceDefinition): Selectors {
  const {name, reduxResourceSelector, reduxResourceActivitySelector} = resource

  if (!selectorsByResource[name]) {
    // Create a new set of selectors
    const selectors = {}

    if (reduxResourceSelector) {
      // Specific resource location specified ?
      selectors.byId = state => reduxResourceSelector(state)[name]
    } else {
      // Default location
      selectors.byId = state => state.resources[name]
    }

    selectors.activity = {}
    if (reduxResourceActivitySelector) {
      // Specific resource location specified ?
      selectors.activity.all = state =>
        reduxResourceActivitySelector(state)[name]
    } else {
      // Default location
      selectors.activity.all = state => state.resourcesActivity[name]
    }

    selectors.asArray = createSelector(selectors.byId, resourceById =>
      Object.values(resourceById)
    )

    selectors.activity.totalFetching = createSelector(
      selectors.activity.all,
      activity => Object.keys(activity.fetching).length
    )

    selectors.activity.totalCreating = createSelector(
      selectors.activity.all,
      activity => Object.keys(activity.creating).length
    )

    selectors.activity.totalUpdating = createSelector(
      selectors.activity.all,
      activity => Object.keys(activity.updating).length
    )

    selectors.activity.totalRemoving = createSelector(
      selectors.activity.all,
      activity => Object.keys(activity.removing).length
    )

    // Store selector instances in global object
    selectorsByResource[name] = selectors
  }

  // Return existing selectors
  return selectorsByResource[name]
}
