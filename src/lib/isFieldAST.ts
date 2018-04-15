import { FieldAST } from './types'

/**
 * Check if an object respects the FieldAST interface
 *
 * @param {any} object
 * @returns {bool}
 */
export default function isFieldAST( object: any ): object is FieldAST {
  return (
    object !== undefined &&
    object !== null &&
    object.variables !== undefined &&
    object.raw !== undefined )
}
