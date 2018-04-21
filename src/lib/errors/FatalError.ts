import ResolveError from './ResolveError'

export class FatalError extends ResolveError {

  public path: string

  constructor( msg: string, path?: string ) {
    super(msg)
    this.path = path
  }

  public shouldWait() { return false }

}

export default FatalError
