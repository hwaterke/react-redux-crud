// @flow
import type {ActivityState} from '../reducers/createActivityReducerForResource'
import type {ResourceDefinition} from '../types/ResourceDefinition'
import type {Selector} from '../types/Selector'

export type ActivitySelector = any => ActivityState
export type ActivityResourceSelector = ResourceDefinition => ActivitySelector

export function createResourceActivitySelector(
  stateLocationSelector: Selector
): ActivityResourceSelector {
  const loadingSelectorRegistry = {}

  return function(resource: ResourceDefinition): ActivitySelector {
    if (!loadingSelectorRegistry[resource.name]) {
      loadingSelectorRegistry[resource.name] = state =>
        stateLocationSelector(state)[resource.name]
    }

    return loadingSelectorRegistry[resource.name]
  }
}
