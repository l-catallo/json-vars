import * as _ from 'lodash'
import { DependencyError, FatalError } from '../lib/errors'
import { Context, Scope, Value } from '../lib/types'

export const Self: Scope = {

  async resolve( name: string, ctx: Context ): Promise<Value> {
    if ( ctx.asts[name] !== undefined ) {
      throw new DependencyError(`Field ${name} is not yet resolved`)
    }
    const value = _.get(ctx.original, name)
    if ( value === undefined ) {
      throw new FatalError(`Cannot find ${name}`)
    } else {
      return value
    }
  }

}

export default Self
