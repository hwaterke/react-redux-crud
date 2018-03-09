// @flow
export type ResourceDefinition = {
  // A unique name for the resource
  name: string,

  // The primary key of the resource
  key: string,

  // The default path on the backend where the resource is available
  defaultPath?: string,

  // PropTypes for this resource
  propTypes: {},

  // If you store the resource and/or its activity info at a special location in redux, you need to provide state selectors.
  // The default resource location is state.resources
  reduxResourceSelector?: Function,
  // The default resource activity location is state.resourcesActivity
  reduxResourceActivitySelector?: Function,
}
