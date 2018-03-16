import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import {Book} from '../resources/resources'
import {crudThunks} from '../thunks/crudThunks'
import {BookForm} from './BookForm'

const mapDispatchToProps = {
  createResource: crudThunks.createResource,
}

class _BookCreate extends React.Component {
  static propTypes = {
    createResource: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  }

  onSubmit = data => {
    this.props
      .createResource({resource: Book, entity: data})
      .then(() => this.props.history.push('/'))
  }

  render() {
    return (
      <Fragment>
        <h3>Create a new book</h3>
        <BookForm onSubmit={this.onSubmit} />
      </Fragment>
    )
  }
}

export const BookCreate = connect(undefined, mapDispatchToProps)(_BookCreate)
