import test from 'ava'
import { DependencyError, FatalError } from '../../src/lib/errors'
import { Context, FieldAST, Value } from '../../src/lib/types'

import resolveField from '../../src/lib/resolveField'

test('should resolve a Field containing only one variable', async t => {
  const ast: FieldAST = {
    raw: '${self:foo.bar}',
    variables: [{
      match: '${self:foo.bar}',
      name: 'foo.bar',
      scope: 'self',
      transformers: [],
    }],
  }
  const res = resolveField(ast, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 42)
  })
})

test('should replace the correct portion of a string', async t => {
  const ast: FieldAST = {
    raw: 'answer: ${self:foo.bar} ',
    variables: [{
      match: '${self:foo.bar}',
      name: 'foo.bar',
      scope: 'self',
      transformers: [],
    }],
  }
  const res = resolveField(ast, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, 'answer: 42 ')
  })
})

test('should resolve a Field that contains multiple variables', async t => {
  const ast: FieldAST = {
    raw: '${self:foo.bar} != ${self:foo.num}',
    variables: [{
      match: '${self:foo.bar}',
      name: 'foo.bar',
      scope: 'self',
      transformers: [],
    }, {
      match: '${self:foo.num}',
      name: 'foo.num',
      scope: 'self',
      transformers: [],
    }],
  }
  const res = resolveField(ast, getFakeContext())
  t.plan(2)
  await t.notThrows(res)
  return res.then( r => {
    t.is(r, '42 != 4')
  })
})

test(
  'should resolve a Field that contains multiple instances of the same variable',
  async t => {
    const ast: FieldAST = {
      raw: '${self:foo.ref} = ${self:foo.${self:foo.ref}}; ${self:foo.ref}',
      variables: [{
        match: '${self:foo.ref}',
        name: 'foo.ref',
        scope: 'self',
        transformers: [],
      }, {
        match: '${self:foo.${self:foo.ref}}',
        name: {
          raw: 'foo.${self:foo.ref}',
          variables: [{
            match: '${self:foo.ref}',
            name: 'foo.ref',
            scope: 'self',
            transformers: [],
          }],
        },
        scope: 'self',
        transformers: [],
      }, {
        match: '${self:foo.ref}',
        name: 'foo.ref',
        scope: 'self',
        transformers: [],
      }],
    }
    const res = resolveField(ast, getFakeContext())
    t.plan(2)
    await t.notThrows(res)
    return res.then( r => {
      t.is(r, 'bar = 42; bar')
    })
  })

function getFakeContext(): Context {
  const original = {
    foo: {
      bar: 42,
      baz: '${self:foo.bar}',
      num: 4,
      ref: 'bar',
    },
  }
  const asts = {
    'foo.bar': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }],
    },
  }
  const scopes = {
    self: {
      resolve( name: string, ctx: Context ): Promise<Value> {
        switch (name) {
          case 'foo.bar':
            return Promise.resolve(42)
          case 'foo.baz':
            return Promise.reject(new DependencyError(''))
          case 'foo.num':
            return Promise.resolve(4)
          case 'foo.ref':
            return Promise.resolve('bar')
          default:
            return Promise.reject(new FatalError(`Cannot find field ${name}`))
        }
      },
    },
  }
  const transformers = {}
  return {
    asts,
    original,
    scopes,
    transformers,
  }
}
