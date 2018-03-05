// @flow

export function invariant(condition: any, message: string) {
  if (!condition) {
    const error = new Error(message)
    error.name = 'Invariant Violation'
    throw error
  }
}

export function requiredParam(param: string) {
  const error = new Error(`Required parameter, "${param}" is missing.`)
  error.name = 'Required Parameter'
  throw error
}
