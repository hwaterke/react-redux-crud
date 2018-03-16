import React, {Fragment} from 'react'
import {ResourceListProvider} from 'redux-crud-provider/build/providers/ResourceListProvider'
import {Link} from 'react-router-dom'
import {Book} from '../resources/resources'
import {crudThunks} from '../thunks/crudThunks'

export const List = () => (
  <ResourceListProvider crudThunks={crudThunks} resource={Book} autoFetch>
    {({entities, loading}) => (
      <Fragment>
        <h1>Book list{loading && ' (refreshing)'}</h1>
        <ul>
          {entities.map(book => (
            <li key={book.id}>
              <span>{book.name}</span>
              <Link to={`/${book.id}/edit`}>Edit</Link>
            </li>
          ))}
        </ul>
      </Fragment>
    )}
  </ResourceListProvider>
)
