import ResolveError from './ResolveError'

export interface FieldAST {
  raw: string,
  variables: VariableAST[],
}

export interface VariableAST {
  match: string,
  scope: string,
  name: string | FieldAST,
  transformers: TransformerAST[],
}

export interface TransformerAST {
  name: string,
  args: ArgumentAST[],
}

export type ArgumentAST = number | string | FieldAST

export interface Scope {
  resolve: ( name: string, ctx: Context ) => Promise<Value>
}

export type Value = number | string | null

export interface Transformer {
  transform: (
    value: Promise<Value>,
    ...args: Value[]
  ) => Promise<Value>
}

export interface LeafVariableAST extends VariableAST {
  match: string,
  scope: string,
  name: string,
  transformers: LeafTransformerAST[],
}

export interface LeafTransformerAST extends TransformerAST {
  name: string,
  args: LeafArgumentAST[],
}

export type LeafArgumentAST = number | string

export interface Context {
  original: ObjectMap<any>,
  asts: ObjectMap<FieldAST>,
  scopes: ObjectMap<Scope>,
  transformers: ObjectMap<Transformer>,
}

export interface SolverOptions {
  scopes: ObjectMap<Scope>,
  transformers: ObjectMap<Transformer>,
}

export interface ObjectMap<T> {
  [key: string]: T
}

