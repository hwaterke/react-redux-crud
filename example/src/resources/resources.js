import PropTypes from 'prop-types'

export const Book = {
  name: 'books',
  key: 'id',
  defaultPath: 'books',

  propTypes: {
    name: PropTypes.string.isRequired,
  },
}

export const Category = {
  name: 'categories',
  key: 'id',

  propTypes: {
    name: PropTypes.string.isRequired,
  },
}
