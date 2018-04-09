/* eslint-disable react/no-unused-prop-types */
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {select} from '../selectors/select'

const mapStateToProps = (state, ownProps) => ({
  entities: select(ownProps.resource).asArray(state),
  fetchAllActivity: select(ownProps.resource).activity.all(state).fetchingAll,
})

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      fetchAll: ownProps.crudThunks.fetchAll,
    },
    dispatch
  )

class _ResourceListProvider extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    resource: PropTypes.shape({
      name: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    }).isRequired,
    path: PropTypes.string,
    params: PropTypes.object,
    replace: PropTypes.bool,
    autoFetch: PropTypes.bool,
    loadingRender: PropTypes.node,

    // From redux
    entities: PropTypes.any,
    fetchAll: PropTypes.func.isRequired,
    fetchAllActivity: PropTypes.number.isRequired,

    // For redux
    crudThunks: PropTypes.shape({
      fetchAll: PropTypes.func.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    replace: false,
    autoFetch: false,
    loadingRender: null,
  }

  state = {
    initialLoading: this.props.autoFetch,
  }

  fetchAll = ({replace = null, params = null} = {}) => {
    this.props.fetchAll({
      resource: this.props.resource,
      path: this.props.path,
      params: params === null ? this.props.params : params,
      replace: replace === null ? this.props.replace : replace,
    })
  }

  componentDidMount() {
    if (this.props.autoFetch) {
      this.fetchAll()
      this.setState({initialLoading: false})
    }
  }

  render() {
    const {loadingRender, entities, fetchAllActivity} = this.props

    const isLoading = this.state.initialLoading || fetchAllActivity > 0

    // Render loading component
    if (loadingRender && isLoading) {
      return loadingRender
    }

    return this.props.children({
      entities,
      fetchAll: this.fetchAll,
      loading: isLoading,
    })
  }
}

export const ResourceListProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(_ResourceListProvider)
