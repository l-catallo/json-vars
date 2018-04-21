import ResolveError from './ResolveError'

export class DependencyError extends ResolveError {

  public shouldWait() { return true }

}

export default DependencyError
