// @flow
import {createSelector} from 'reselect'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import type {Selector} from '../types/Selector'

export type ResourceSelector = any => {[string]: any}
export type ResourceResourceSelector = ResourceDefinition => ResourceSelector
export type ResourceSelectors = {
  byId: ResourceResourceSelector,
  asArray: ResourceResourceSelector,
}

export function createResourceSelectors(
  stateLocationSelector: Selector
): ResourceSelectors {
  const byIdSelectorRegistry = {}
  const arraySelectorRegistry = {}

  const byId = function(resource: ResourceDefinition) {
    if (!byIdSelectorRegistry[resource.name]) {
      byIdSelectorRegistry[resource.name] = state =>
        stateLocationSelector(state)[resource.name]
    }

    return byIdSelectorRegistry[resource.name]
  }

  const asArray = function(resource: ResourceDefinition) {
    if (!arraySelectorRegistry[resource.name]) {
      arraySelectorRegistry[resource.name] = createSelector(
        byId(resource),
        resourceById => Object.values(resourceById)
      )
    }

    return arraySelectorRegistry[resource.name]
  }

  return {
    byId,
    asArray,
  }
}
