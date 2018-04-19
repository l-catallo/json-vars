import * as _ from 'lodash'
import isFieldAST from './isFieldAST'
import { FatalError } from './errors'
import resolveField from './resolveField'
import { Context, TransformerAST, Value } from './types'

/**
 * Takes a transformer's AST and returns an async function that can apply the
 * transformation
 *
 * @param {TransformerAST} ast
 * @param {Context} ctx
 * @returns {(v: Promise<Value>) => Promise<Value>}
 */
export default function resolveTransformer(
  ast: TransformerAST,
  ctx: Context,
): (v: Promise<Value>) => Promise<Value> {
  const transformer = ctx.transformers[ast.name]
  if ( transformer === undefined ) {
    throw new FatalError(`Cannot find Transformer ${ast.name}`)
  }
  return async value => {
    const argsPromises = ast.args.map( arg => {
      if (isFieldAST(arg)) {
        return resolveField(arg, ctx)
      } else {
        return Promise.resolve(arg)
      }
    })
    return Promise.all(argsPromises).then( args => {
      return transformer.transform(value, ...args)
    })
  }
}
