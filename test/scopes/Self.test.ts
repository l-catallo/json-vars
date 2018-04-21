import test from 'ava'
import { DependencyError, FatalError } from '../../src/lib/errors'
import { Context, FieldAST, ObjectMap } from '../../src/lib/types'

import Self from '../../src/scopes/Self'

test('should return the value when the path points to a resolved field', t => {
  const res = Self.resolve('foo.baz', getFakeContext())
  t.plan(1)
  return res.then( r => {
    t.is(r, 42)
  })
})

test(
  'should return a WAITING ResolveError when the path points to an unresolved field',
  async t => {
    const err = await t.throws(Self.resolve('fuu.bar', getFakeContext()))
    t.true(err instanceof DependencyError)
  })

test(
  'should return a FATAL ResolveError when the path points to a non-existent field',
  async t => {
    t.plan(2)
    const err = await t.throws(Self.resolve('fuu.nonexistent', getFakeContext()))
    t.true(err instanceof FatalError)
  })

function getFakeContext(): Context {
  const original: ObjectMap<any> = {
    foo: {
      bar: '${self:fuu.bar}',
      baz: 42,
    },
    fuu: {
      bar: '${self:foo.baz}',
      baz: '${self:foo.nonexistent}',
    },
  }
  const asts: ObjectMap<FieldAST> = {
    'foo.bar': {
      raw: '${self:fuu.bar}',
      variables: [{
        match: '${self:fuu.bar}',
        name: 'fuu.bar',
        scope: 'self',
        transformers: [],
      }],
    },
    'fuu.bar': {
      raw: '${self:foo.baz}',
      variables: [{
        match: '${self:foo.baz}',
        name: 'foo.baz',
        scope: 'self',
        transformers: [],
      }],
    },
    'fuu.baz': {
      raw: '${self:foo.nonexistent}',
      variables: [{
        match: '${self:foo.nonexistent}',
        name: 'foo.nonexistent',
        scope: 'self',
        transformers: [],
      }],
    },
  }
  return {
    asts,
    original,
    scopes: {},
    transformers: {},
  }
}
