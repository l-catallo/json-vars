export abstract class ResolveError extends Error {

  public path: string

  abstract shouldWait(): boolean

}

export default ResolveError
