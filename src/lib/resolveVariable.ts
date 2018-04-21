import { compose as composeFn, identity } from 'lodash/fp'
import { FatalError } from './errors'
import isFieldAST from './isFieldAST'
import isLeaf from './isLeaf'
import resolveField from './resolveField'
import resolveTransformer from './resolveTransformer'
import { Context, TransformerAST, Value, VariableAST } from './types'

/**
 * Takes a Variable's AST and tries to resolve it looking at the Context
 *
 * @param {VariableAST} ast
 * @param {Context} ctx
 * @returns {Promise<Value>}
 */
export default async function resolveVariable(
  ast: VariableAST,
  ctx: Context,
): Promise<Value> {
  const scope = ctx.scopes[ast.scope]
  if (scope === undefined) {
    throw new FatalError(`Cannot find Scope ${ast.scope}`)
  }
  // chain all transformers in a single function
  const transform = ast.transformers
    .map( t => resolveTransformer(t, ctx) )
    .reduce( (prev, current) => composeFn(current, prev), identity)
  if (isFieldAST(ast.name)) {
    const name = resolveField(ast.name, ctx)
    return name.then( n => transform(scope.resolve(n.toString(), ctx)))
  } else {
    return transform(scope.resolve(ast.name, ctx))
  }
}
