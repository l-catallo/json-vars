import isFieldAST from './isFieldAST'
import { LeafVariableAST, VariableAST } from './types'

/**
 * Check if a variable has no other variable in its name or
 * in its transformers' arguments
 *
 * @param {VariableAST} variable
 * @returns {boolean}
 */
export default function isLeaf(
  variable: VariableAST,
): variable is LeafVariableAST {
  return (
    !isFieldAST(variable.name) &&
    variable.transformers.every( t => t.args.every( arg => !isFieldAST(arg) ) )
  )
}
