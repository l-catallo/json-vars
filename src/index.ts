import * as errors from './lib/errors'
import { ObjectMap } from './lib/types'
import { Solver } from './Solver'

function resolve(obj: ObjectMap<any>): Promise<ObjectMap<any>> {
  const solver = new Solver()
  return solver.resolve(obj)
}

export { resolve, Solver }
export * from './lib/types'
export { errors }
