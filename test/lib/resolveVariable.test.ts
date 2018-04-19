import test from 'ava'
import { DependencyError, FatalError } from '../../src/lib/errors'
import { Context, LeafVariableAST, Value, VariableAST } from '../../src/lib/types'

import resolveVariable from '../../src/lib/resolveVariable'

test('should resolve a simple variable', async t => {
  const variable: LeafVariableAST = {
    match: '${self:foo.bar}',
    scope: 'self',
    name: 'foo.bar',
    transformers: [],
  }
  const res = resolveVariable(variable, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'baz')
  })
})

test('should resolve a variable with a single transformer', async t => {
  const variable: LeafVariableAST = {
    match: '${self:foo.bar|capitalize}',
    scope: 'self',
    name: 'foo.bar',
    transformers: [{
      name: 'capitalize',
      args: [],
    }],
  }
  const res = resolveVariable(variable, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'BAZ')
  })
})

test('should resolve Transformers in the correct order', async t => {
  const variable: LeafVariableAST = {
    match: '${self:foo.bar|capitalize|concat(hello,world)}',
    scope: 'self',
    name: 'foo.bar',
    transformers: [{
      name: 'capitalize',
      args: [],
    }, {
      name: 'concat',
      args: ['hello', 'world'],
    }],
  }
  const res = resolveVariable(variable, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'helloworld')
  })
})

test('should resolve a Variable that has a FieldAST in the name', async t => {
  const variable: VariableAST = {
    match: '${self:foo.${self:foo.ref}}',
    scope: 'self',
    name: {
      raw: 'foo.${self:foo.ref}',
      variables: [{
        match: '${self:foo.ref}',
        scope: 'self',
        name: 'foo.ref',
        transformers: [],
      }],
    },
    transformers: [],
  }
  const res = resolveVariable(variable, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'baz')
  })
})

test(
  'should return a FATAL ResolveError if a scope is not defined in the Context',
  async t => {
    const variable: LeafVariableAST = {
      match: '${nonexistentscope:somename}',
      scope: 'nonexistentscope',
      name: 'somename',
      transformers: [],
    }
    t.plan(2)
    const err = await t.throws(resolveVariable(variable, getFakeContext()))
    t.true(err instanceof FatalError)
  })

test('should pass on ResolveErrors coming from the scope', async t => {
  const variable: LeafVariableAST = {
    match: '${self:foo.biz}',
    scope: 'self',
    name: 'foo.biz',
    transformers: [],
  }
  t.plan(2)
  const err = await t.throws(resolveVariable(variable, getFakeContext()))
  t.true(err instanceof DependencyError)
})

function getFakeContext(): Context {
  const original = {
    foo: {
      bar: 'baz',
      baz: '${self:foo.bar}',
      biz: '${self:foo.baz|capitalize}',
      ref: 'bar',
    }
  }
  const asts = {
    'foo.baz': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        scope: 'self',
        name: 'foo.bar',
        transformers: [],
      }]
    },
    'foo.biz': {
      raw: '${self:foo.baz|capitalize}',
      variables: [{
        match: '${self:foo.baz|capitalize}',
        scope: 'self',
        name: 'foo.baz',
        transformers: [{
          name: 'capitalize',
          args: []
        }],
      }]
    }
  }
  const scopes = {
    self: {
      resolve( name: string, ctx: Context ): Promise<Value> {
        switch (name) {
          case 'foo.ref':
            return Promise.resolve('bar')
          case 'foo.bar':
            return Promise.resolve('baz')
          case 'foo.baz':
          case 'foo.biz':
            const msg = `Field ${name} is not yet resolved`
            return Promise.reject(new DependencyError(msg))
          default:
            return Promise.reject(new FatalError('Cannot find foo.biz'))
        }
      }
    }
  }
  const transformers = {
    capitalize(
      value: Promise<Value>,
      ...args: Value[]
    ): Promise<Value> {
      return value.then( v => v.toString().toUpperCase() )
    },
    concat(
      value: Promise<Value>,
      ...args: Value[]
    ): Promise<Value> {
      return Promise.resolve(args.join(''))
    },
  }

  return {
    original,
    asts,
    scopes,
    transformers,
  }
}
