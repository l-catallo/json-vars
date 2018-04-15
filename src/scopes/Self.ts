import * as _ from 'lodash'
import ResolveError from '../lib/ResolveError'
import { ResolveErrorType } from '../lib/ResolveError'
import { Context, Scope, Value } from '../lib/types'

export const Self: Scope = {

  async resolve( name: string, ctx: Context ): Promise<Value> {
    if ( ctx.asts[name] !== undefined ) {
      const msg = `Field ${name} is not yet resolved`
      throw new ResolveError(msg, undefined, ResolveErrorType.WAITING)
    }
    const value = _.get(ctx.original, name)
    if ( value === undefined ) {
      throw new ResolveError(`Cannot find ${name}`)
    } else {
      return value
    }
  }

}

export default Self
