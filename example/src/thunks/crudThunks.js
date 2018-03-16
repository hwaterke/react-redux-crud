import cuid from 'cuid'
import {createCrudThunks} from 'redux-crud-provider/build/thunks/createCrudThunks'

export const crudThunks = createCrudThunks({
  backendSelector: () => 'http://localhost:5000',
  cuid: () => cuid(),
})
