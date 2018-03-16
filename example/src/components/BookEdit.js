import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {ResourceProvider} from 'redux-crud-provider/build/providers/ResourceProvider'
import {Book} from '../resources/resources'
import {crudThunks} from '../thunks/crudThunks'
import {BookForm} from './BookForm'

export class BookEdit extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  }

  render() {
    const {match} = this.props
    return (
      <ResourceProvider
        crudThunks={crudThunks}
        uuid={match.params.uuid}
        resource={Book}
        autoFetch
        loadingRender={<div>Loading</div>}
        postAction={() => this.props.history.push('/')}
      >
        {({entity, updateEntity, deleteEntity, isUpdating, isRemoving}) => (
          <Fragment>
            <h3>Edit an existing book</h3>
            <BookForm initialValues={entity} onSubmit={updateEntity} />
            <button type="button" onClick={deleteEntity}>
              Delete
            </button>

            {isUpdating && (
              <div>
                <b>Updating</b>
              </div>
            )}
            {isRemoving && (
              <div>
                <b>Removing</b>
              </div>
            )}
          </Fragment>
        )}
      </ResourceProvider>
    )
  }
}
