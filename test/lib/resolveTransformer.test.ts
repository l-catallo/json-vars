import test from 'ava'
import { DependencyError, FatalError } from '../../src/lib/errors'
import { Context, LeafTransformerAST, TransformerAST, Value } from '../../src/lib/types'

import resolveTransformer from '../../src/lib/resolveTransformer'

test('should resolve a simple transformer', async t => {
  const transformer: LeafTransformerAST = {
    args: [],
    name: 'capitalize',
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.plan(3)
  t.true(fn instanceof Function)
  const res = fn(Promise.resolve('foo'))
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'FOO')
  })
})

test('should pass all the arguments to the Transformer', async t => {
  const transformer: LeafTransformerAST = {
    args: ['hello ', 'world'],
    name: 'concat',
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.plan(3)
  t.true(fn instanceof Function)
  const res = fn(Promise.resolve(42))
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'hello world')
  })
})

test('should resolve a non-leaf Transformer', async t => {
  const transformer: TransformerAST = {
    args: ['hello ', {
      raw: '${self:foo.name}',
      variables: [{
        match: '${self:foo.name}',
        name: 'foo.name',
        scope: 'self',
        transformers: [],
      }],
    }],
    name: 'concat',
  }
  const fn = resolveTransformer(transformer, getFakeContext())
  t.plan(3)
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
      args: [],
      name: 'nonexistenttransformer',
    }
    t.plan(1)
    t.throws(() => resolveTransformer(transformer, getFakeContext()), FatalError)
  })

test('should pass on Rejections returned by the Transformer', async t => {
  const transformer: LeafTransformerAST = {
    args: [],
    name: 'error',
  }
  const fn = await resolveTransformer(transformer, getFakeContext())
  t.plan(1)
  await t.throws(fn(Promise.resolve('')), FatalError)
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
            return Promise.reject(new FatalError(`Cannot find field ${name}`))
        }
      },
    },
  }
  const transformers = {
    capitalize(
      value: Promise<Value>,
      ...args: Value[],
    ): Promise<Value> {
      return value.then( v => v.toString().toUpperCase() )
    },
    concat(
      value: Promise<Value>,
      ...args: Value[],
    ): Promise<Value> {
      return Promise.resolve(args.join(''))
    },
    error(
      value: Promise<Value>,
      ...args: Value[],
    ): Promise<Value> {
      return Promise.reject(new FatalError(''))
    },
  }
  return {
    asts,
    original,
    scopes,
    transformers,
  }
}
