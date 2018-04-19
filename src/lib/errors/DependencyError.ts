import ResolveError from './ResolveError'

export class DependencyError extends ResolveError {

  shouldWait() { return true }

}

export default DependencyError
