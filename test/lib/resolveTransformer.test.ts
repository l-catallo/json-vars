import test from 'ava'
import ResolveError from '../../src/lib/ResolveError'
import { ResolveErrorType } from '../../src/lib/ResolveError'
import { Context, LeafTransformerAST, TransformerAST, Value } from '../../src/lib/types'

import resolveTransformer from '../../src/lib/resolveTransformer'

test('should resolve a simple transformer', async t => {
  const transformer: LeafTransformerAST = {
    name: 'capitalize',
    args: [],
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.true(fn instanceof Function)
  const res = fn(Promise.resolve('foo'))
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'FOO')
  })
})

test('should pass all the arguments to the Transformer', async t => {
  const transformer: LeafTransformerAST = {
    name: 'concat',
    args: ['hello ', 'world'],
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.true(fn instanceof Function)
  const res = fn(Promise.resolve(42))
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'hello world')
  })
})

test('should resolve a non-leaf Transformer', async t => {
  const transformer: TransformerAST = {
    name: 'concat',
    args: ['hello ', {
      raw: '${self:foo.name}',
      variables: [{
        match: '${self:foo.name}',
        scope: 'self',
        name: 'foo.name',
        transformers: [],
      }],
    }],
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.true(fn instanceof Function)
  const res = fn(Promise.resolve(42))
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'hello John')
  })
})

test(
  'should return a FATAL ResolveError if the the transformer is not defined in the Context',
  t => {
    const transformer: LeafTransformerAST = {
      name: 'nonexistenttransformer',
      args: [],
    }
    const err = t.throws(
      () => resolveTransformer(transformer, getFakeContext()),
      ResolveError )
    t.is((err as ResolveError).errorType, ResolveErrorType.FATAL)
  })

test('should pass on Rejections returned by the Transformer', async t => {
  const transformer: LeafTransformerAST = {
    name: 'error',
    args: [],
  }
  const fn = await resolveTransformer(transformer, getFakeContext())
  const err = await t.throws(fn(Promise.resolve('')), ResolveError)
  t.is((err as ResolveError).errorType, ResolveErrorType.FATAL)
})

function getFakeContext(): Context {
  const original = {
    foo: {
      name: 'John',
    },
  }
  const asts = {}
  const scopes = {
    self: {
      resolve( name: string, ctx: Context ): Promise<Value> {
        switch (name) {
          case 'foo.name':
            return Promise.resolve('John')
          default:
            return Promise.reject(new ResolveError(`Cannot find field ${name}`))
        }
      }
    }
  }
  const transformers = {
    capitalize: {
      transform(
        value: Promise<Value>,
        ...args: Value[]
      ): Promise<Value> {
        return value.then( v => v.toString().toUpperCase() )
      }
    },
    concat: {
      transform(
        value: Promise<Value>,
        ...args: Value[]
      ): Promise<Value> {
        return Promise.resolve(args.join(''))
      }
    },
    error: {
      transform(
        value: Promise<Value>,
        ...args: Value[]
      ): Promise<Value> {
        return Promise.reject(new ResolveError(''))
      }
    }
  }
  return {
    original,
    asts,
    scopes,
    transformers,
  }
}
