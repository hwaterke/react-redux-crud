import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      createResource: ownProps.crudThunks.createResource,
    },
    dispatch
  )

class _ResourceCreator extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    resource: PropTypes.shape({
      name: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    }).isRequired,
    path: PropTypes.string,
    postAction: PropTypes.func,

    // From redux
    createResource: PropTypes.func.isRequired,

    // For redux
    // eslint-disable-next-line react/no-unused-prop-types
    crudThunks: PropTypes.shape({
      createResource: PropTypes.func.isRequired,
    }).isRequired,
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  createEntity = entity => {
    const {resource, path, postAction} = this.props

    return this.props
      .createResource({
        resource: resource,
        path: path,
        entity,
      })
      .then(() => {
        if (this._isMounted && postAction) {
          postAction()
        }
      })
  }

  render() {
    return this.props.children({
      createEntity: this.createEntity,
      thunks: {
        createResource: this.props.createResource,
      },
    })
  }
}

export const ResourceCreator = connect(
  undefined,
  mapDispatchToProps
)(_ResourceCreator)
