export abstract class ResolveError extends Error {

  public path: string

  public abstract shouldWait(): boolean

}

export default ResolveError
