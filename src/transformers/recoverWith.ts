import { FatalError } from '../lib/errors'
import { Transformer, Value } from '../lib/types'

export const recoverWith: Transformer =
  ( value: Promise<Value>, ...args: Value[] ): Promise<Value> => {
    const d = args[0]
    if ( d === undefined ) {
      const msg = 'The `default` transformer needs one argument'
      return Promise.reject(new FatalError(msg))
    }
    return value.catch( e => {
      return d
    })
  }

export default recoverWith
