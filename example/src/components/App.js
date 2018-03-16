import React, {Fragment} from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom'
import {store} from '../store/store'
import {BookCreate} from './BookCreate'
import {BookEdit} from './BookEdit'
import {List} from './List'

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Fragment>
            <nav>
              <Link to="/">Books</Link>
              <Link to="/create">New book</Link>
            </nav>

            <section>
              <Switch>
                <Route exact path="/" component={List} />
                <Route exact path="/create" component={BookCreate} />
                <Route exact path="/:uuid/edit" component={BookEdit} />
              </Switch>
            </section>
          </Fragment>
        </BrowserRouter>
      </Provider>
    )
  }
}
