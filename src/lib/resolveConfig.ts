import * as _ from 'lodash'
import { DependencyError, FatalError, ResolveError } from './errors'
import extractFieldASTs from './extractFieldASTs'
import resolveField from './resolveField'
import { Context, ObjectMap, Scope, Transformer } from './types'

export default async function resolveConfig(
  obj: ObjectMap<any>,
  scopes: ObjectMap<Scope>,
  transformers: ObjectMap<Transformer>,
): Promise<ObjectMap<any>> {

  obj = Object.assign(obj)
  let asts = extractFieldASTs(obj)
  if (Object.keys(asts).length === 0) {
    return obj
  }

  let resolved: number
  while (resolved !== 0) {
    resolved = 0
    for (const path in asts) {
      if (asts.hasOwnProperty(path)) {
        const ctx: Context = {
          asts,
          original: obj,
          scopes,
          transformers,
        }
        await resolveField(asts[path], ctx).then( res => {
          resolved++
          _.set(obj, path, res)
          asts = _.omit(asts, path)
        }).catch( err => {
          if ( err instanceof ResolveError ) {
            if ( !err.shouldWait() ) {
              err.path = path
              throw err
            } // else ignore error and continue on
          } else {
            throw err
          }
        })
      }
    }
  }

  if (Object.keys(asts).length > 0) {
    const msg = 'Could not resolve all variables, check your config for dependency loops'
    throw(new FatalError(msg))
  }

  return obj

}
