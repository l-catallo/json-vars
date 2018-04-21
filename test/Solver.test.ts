import test from 'ava'
import { FatalError } from '../src/lib/errors'

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
              throw new FatalError('')
          }
        },
      },
    },
    transformers: {},
  }
  t.context.solver = new Solver(options)
})

test('should ignore a config that does not contain variables', async t => {
  const obj = {
    bar: 'some value',
    foo: 42,
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should resolve simple variables', async t => {
  const obj = {
    bar: {
      bool: '${self:src.bool}',
      num: '${self:src.num}',
      str: '${self:src.str}',
    },
    foo: '${env:FOO}',
    src: {
      bool: true,
      num: 42,
      str: 'hello',
    },
  }
  const expected = {
    bar: {
      bool: true,
      num: 42,
      str: 'hello',
    },
    foo: 'bar',
    src: {
      bool: true,
      num: 42,
      str: 'hello',
    },
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should handle dependencies between variables', async t => {
  const obj = {
    bar: '${self:baz}',
    baz: '${env:FOO}',
    foo: '${self:${env:FOO}}',
  }
  const expected = {
    bar: 'bar',
    baz: 'bar',
    foo: 'bar',
  }
  const res = t.context.solver.resolve(obj)
  t.plan(2)
  await t.notThrows(res)
  return res.then( o => t.is(obj, o) )
})

test('should detect dependency loops and fail', async t => {
  const obj = {
    bar: '${self:baz}',
    baz: '${self:foo}',
    foo: '${self:${env:FOO}}',
  }
  const res = t.context.solver.resolve(obj)
  t.plan(1)
  const err = await t.throws(res, FatalError)
})
