import ResolveError from './ResolveError'

export class FatalError extends ResolveError {

  public path: string

  constructor(
    msg: string,
    path: string = undefined,
  ) {
    super(msg)
    this.path = path
  }

  shouldWait() { return false }

}

export default FatalError
