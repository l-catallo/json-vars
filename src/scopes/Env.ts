import { FatalError } from '../lib/errors'
import { ObjectMap, Scope, Value } from '../lib/types'

export class Env implements Scope {

  private env: ObjectMap<string>

  constructor( env?: ObjectMap<string> ) {
    if ( env !== undefined ) {
      this.env = env
    } else {
      this.env = process.env
    }
  }

  async resolve( name: string ): Promise<Value> {
    if ( this.env[name] !== undefined ) {
      return this.env[name]
    } else {
      throw new FatalError(`the environment variable ${name} is not defined`)
    }
  }

}

export default Env
