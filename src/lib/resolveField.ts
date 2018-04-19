import * as _ from 'lodash'
import isLeaf from './isLeaf'
import resolveVariable from './resolveVariable'
import { Context, FieldAST, ObjectMap, Value } from './types'

/**
 * Takes a Field's AST and tries to resolve it looking at the Context
 *
 * @param {FieldAST} ast
 * @param {Context} ctx
 * @returns {Promise<Value>}
 */
export async function resolveField(
  ast: FieldAST,
  ctx: Context
): Promise<Value> {
  // remove duplicate variables
  const variables = _.uniqBy(
    _.sortBy(ast.variables, v => v.match), // sort variables to avoid collisions
    v => v.match )
  const varsPromises = variables.map( v => {
    return resolveVariable(v, ctx).then( result => {
      return {
        variable: v,
        result,
      }
    })
  })
  return Promise.all(varsPromises).then( vars => {
    let finalResult: Value = ast.raw as Value
    for (let i=0; i<vars.length; i++) {
      const {variable, result} = vars[i]
      finalResult = replaceMatch(finalResult as string, variable.match, result)
    }
    return finalResult
  })
}

function replaceMatch( raw: string, match: string, value: Value ): Value {
  if (raw === match) {
    return value
  } else {
    const stringValue =
      ( value === undefined || value === null ) ? '' : value.toString()
    const reg = new RegExp(match.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')
    return raw.replace(reg, stringValue)
  }
}

export default resolveField
