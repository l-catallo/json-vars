import ResolveError from '../lib/ResolveError'
import { Transformer, Value } from '../lib/types'

export const Default: Transformer = {

  transform(
    value: Promise<Value>,
    ...args: Value[]
  ): Promise<Value> {
    const d = args[0]
    if ( d === undefined ) {
      const error = new ResolveError('The `default` transformer needs one argument')
      return Promise.reject(error)
    }
    return value.catch( e => {
      return d
    })
  }

}

export default Default
