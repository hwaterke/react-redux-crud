/* eslint-disable react/no-unused-prop-types */
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {select} from '../selectors/select'

const mapStateToProps = (state, ownProps) => ({
  entity: select(ownProps.resource).byId(state)[ownProps.uuid],
  activity: select(ownProps.resource).activity.all(state),
})

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      fetchOne: ownProps.crudThunks.fetchOne,
      updateResource: ownProps.crudThunks.updateResource,
      deleteResource: ownProps.crudThunks.deleteResource,
    },
    dispatch
  )

class _ResourceProvider extends React.Component {
  static propTypes = {
    uuid: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    resource: PropTypes.shape({
      name: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    }).isRequired,
    path: PropTypes.string,
    autoFetch: PropTypes.bool,
    loadingRender: PropTypes.node,
    postAction: PropTypes.func,

    // From redux
    entity: PropTypes.object,
    fetchOne: PropTypes.func.isRequired,
    updateResource: PropTypes.func.isRequired,
    deleteResource: PropTypes.func.isRequired,
    activity: PropTypes.shape({
      fetching: PropTypes.object.isRequired,
      updating: PropTypes.object.isRequired,
      removing: PropTypes.object.isRequired,
    }).isRequired,

    // For redux
    crudThunks: PropTypes.shape({
      fetchOne: PropTypes.func.isRequired,
      updateResource: PropTypes.func.isRequired,
      deleteResource: PropTypes.func.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    autoFetch: false,
    loadingRender: null,
  }

  state = {
    initialLoading: this.props.autoFetch,
  }

  fetchEntity = () => {
    return this.props.fetchOne({
      resource: this.props.resource,
      path: this.props.path,
      uuid: this.props.uuid,
    })
  }

  componentDidMount() {
    if (this.props.autoFetch) {
      this.fetchEntity()
      this.setState({initialLoading: false})
    }
  }

  componentDidUpdate(prevProps) {
    const {uuid, postAction, activity: {updating, removing}} = this.props

    if (prevProps.uuid === uuid && postAction) {
      if (
        (prevProps.activity.updating[uuid] && !updating[uuid]) ||
        (prevProps.activity.removing[uuid] && !removing[uuid])
      ) {
        postAction()
      }
    }
  }

  updateResource = data => {
    const entity = {
      ...data,
      uuid: this.props.uuid,
    }

    return this.props.updateResource({
      resource: this.props.resource,
      path: this.props.path,
      entity: entity,
    })
  }

  deleteEntity = () => {
    return this.props.deleteResource({
      resource: this.props.resource,
      path: this.props.path,
      entity: {
        ...this.props.entity,
        uuid: this.props.uuid,
      },
    })
  }

  render() {
    const {loadingRender, entity} = this.props

    const isFetching =
      !!this.props.activity.fetching[this.props.uuid] ||
      this.state.initialLoading
    const isUpdating = !!this.props.activity.updating[this.props.uuid]
    const isRemoving = !!this.props.activity.removing[this.props.uuid]

    // Render loading component
    if (loadingRender && isFetching) {
      return loadingRender
    }

    return this.props.children({
      entity,
      fetchEntity: this.fetchEntity,
      updateEntity: this.updateResource,
      deleteEntity: this.deleteEntity,
      isFetching,
      isUpdating,
      isRemoving,
    })
  }
}

export const ResourceProvider = connect(mapStateToProps, mapDispatchToProps)(
  _ResourceProvider
)
