export enum ResolveErrorType {
  FATAL,
  WAITING,
}

export class ResolveError extends Error {

  public path: string
  public errorType: ResolveErrorType

  constructor(
    msg: string,
    path: string = undefined,
    errorType: ResolveErrorType = ResolveErrorType.FATAL
  ) {
    super(msg)
    this.path = path
    this.errorType = errorType
  }

}

export default ResolveError
