import test from 'ava'
import ResolveError from '../../src/lib/ResolveError'
import { ResolveErrorType } from '../../src/lib/ResolveError'
import { Context, FieldAST, Value } from '../../src/lib/types'

import resolveField from '../../src/lib/resolveField'

test('should resolve a Field containing only one variable', async t => {
  const ast: FieldAST = {
    raw: '${self:foo.bar}',
    variables: [{
      match: '${self:foo.bar}',
      scope: 'self',
      name: 'foo.bar',
      transformers: [],
    }]
  }
  const res = resolveField(ast, getFakeContext())
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
      scope: 'self',
      name: 'foo.bar',
      transformers: [],
    }]
  }
  const res = resolveField(ast, getFakeContext())
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
      scope: 'self',
      name: 'foo.bar',
      transformers: [],
    }, {
      match: '${self:foo.num}',
      scope: 'self',
      name: 'foo.num',
      transformers: [],
    }]
  }
  const res = resolveField(ast, getFakeContext())
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
        scope: 'self',
        name: 'foo.ref',
        transformers: [],
      }, {
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
      }, {
        match: '${self:foo.ref}',
        scope: 'self',
        name: 'foo.ref',
        transformers: [],
      }]
    }
    const res = resolveField(ast, getFakeContext())
    await t.notThrows(res)
    return res.then( r => {
      t.is(r, 'bar = 42; bar')
    })
  })

function getFakeContext(): Context {
  const original = {
    foo: {
      num: 4,
      bar: 42,
      baz: '${self:foo.bar}',
      ref: 'bar',
    },
  }
  const asts = {
    'foo.bar': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        scope: 'self',
        name: 'foo.bar',
        transformers: [],
      }]
    },
  }
  const scopes = {
    self: {
      resolve( name: string, ctx: Context ): Promise<Value> {
        switch (name) {
          case 'foo.bar':
            return Promise.resolve(42)
          case 'foo.baz':
            return Promise.reject(
              new ResolveError('', undefined, ResolveErrorType.WAITING))
          case 'foo.num':
            return Promise.resolve(4)
          case 'foo.ref':
            return Promise.resolve('bar')
          default:
            return Promise.reject(new ResolveError(`Cannot find field ${name}`))
        }
      }
    }
  }
  const transformers = {}
  return {
    original,
    asts,
    scopes,
    transformers,
  }
}
