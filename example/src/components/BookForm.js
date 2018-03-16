import PropTypes from 'prop-types'
import React from 'react'
import {Field, reduxForm} from 'redux-form'

export const _BookForm = ({handleSubmit}) => (
  <form onSubmit={handleSubmit}>
    <Field name="name" component="input" />
    <button type="submit">Save</button>
  </form>
)

_BookForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export const BookForm = reduxForm({form: 'book'})(_BookForm)
