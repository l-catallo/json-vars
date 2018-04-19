import test from 'ava'
import { ResolveError, ResolveErrorType } from '../src/lib/ResolveError'

import Solver from '../src/Solver'

test.beforeEach(t => {
  const options = {
    scopes: {
      env: {
        async resolve(name, ctx) {
          switch (name) {
            case 'FOO':
              return 'bar'
            default:
              throw new ResolveError('')
          }
        }
      }
    },
    transformers: {}
  }
  t.context.solver = new Solver(options)
})

test('should ignore a config that does not contain variables', async t => {
  const obj = {
    foo: 42,
    bar: 'some value',
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should resolve simple variables', async t => {
  const obj = {
    foo: '${env:FOO}',
    src: {
      str: 'hello',
      num: 42,
      bool: true,
    },
    bar: {
      str: '${self:src.str}',
      num: '${self:src.num}',
      bool: '${self:src.bool}',
    },
  }
  const expected = {
    foo: 'bar',
    src: {
      str: 'hello',
      num: 42,
      bool: true,
    },
    bar: {
      str: 'hello',
      num: 42,
      bool: true,
    },
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should handle dependencies between variables', async t => {
  const obj = {
    foo: '${self:${env:FOO}}',
    bar: '${self:baz}',
    baz: '${env:FOO}',
  }
  const expected = {
    foo: 'bar',
    bar: 'bar',
    baz: 'bar',
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should detect dependency loops and fail', async t => {
  const obj = {
    foo: '${self:${env:FOO}}',
    bar: '${self:baz}',
    baz: '${self:foo}',
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  const err = await t.throws(res, ResolveError)
  t.is((err as ResolveError).errorType, ResolveErrorType.FATAL)
})
