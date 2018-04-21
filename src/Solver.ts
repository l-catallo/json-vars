import * as _ from 'lodash'
import resolveConfig from './lib/resolveConfig'
import { Context, ObjectMap, Scope, SolverOptions, Transformer } from './lib/types'
import * as defaultScopes from './scopes'
import * as defaultTransformers from './transformers'

export class Solver {

  protected readonly options: SolverOptions

  constructor( options?: SolverOptions ) {
    const defaults: SolverOptions = {
      scopes: {
        env: new defaultScopes.Env(process.env),
        self: defaultScopes.Self,
      },
      transformers: {
        default: defaultTransformers.recoverWith,
      },
    }
    this.options = _.merge(defaults, options)
  }

  public resolve(obj: ObjectMap<any>): Promise<ObjectMap<any>> {
    return resolveConfig(obj, this.options.scopes, this.options.transformers)
  }

}

export default Solver
