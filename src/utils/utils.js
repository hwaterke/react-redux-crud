// @flow

export function invariant(condition: any, message: string) {
  if (!condition) {
    const error = new Error(message)
    error.name = 'Invariant Violation'
    throw error
  }
}
