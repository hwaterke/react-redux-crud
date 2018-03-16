import {createActivityReducersForResources} from 'redux-crud-provider/build/reducers/createActivityReducersForResources'
import {createReducersForResources} from 'redux-crud-provider/build/reducers/createReducersForResources'
import {reducer as formReducer} from 'redux-form'
import {Book, Category} from '../resources/resources'

export const reducers = {
  resources: createReducersForResources([Book, Category]),
  resourcesActivity: createActivityReducersForResources([Book, Category]),
  form: formReducer,
}
