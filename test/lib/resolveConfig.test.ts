import test from 'ava'
import { DependencyError, FatalError } from '../../src/lib/errors'
import { Context, ObjectMap, Scope, Transformer, Value } from '../../src/lib/types'

import resolveConfig from '../../src/lib/resolveConfig'

/* Test cases are organized in arrays with the following structure
 * [ <description>, <input>, <expected result> ]
 */
const testCases = [

  [ 'should leave unchanged a Config that has no variables',
    {
      baz: {
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      },
      foo: 'bar',
    }, {
      baz: {
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      },
      foo: 'bar',
    }],

  [ 'should resolve a simple Config',
    {
      foo: {
        bar: 42,
        baz: '${dummy:number}',
      },
    }, {
      foo: {
        bar: 42,
        baz: 42,
      },
    }],

  [ 'should resolve a config with internal dependency',
    {
      bar: '${dummy:string}',
      foo: '${dummy:waiting}',
    }, {
      bar: 'hello',
      foo: 'done',
    }],

]

testCases.forEach( c => {
  const description = c[0] as string
  const input = c[1] as ObjectMap<any>
  const expected = c[2] as ObjectMap<any>
  test(description, async t => {
    const res = resolveConfig(input, getScopes(), getTransformers())
    t.plan(2)
    await t.notThrows(res)
    return res.then( r => {
      t.deepEqual(r, expected)
    })
  })
})

test('should throw a FATAL ResolveError if there is a dependency lock', t => {
  const input = {
    foo: '${dummy:waiting}',
  }
  t.plan(1)
  return t.throws(resolveConfig(input, getScopes(), getTransformers()), FatalError)
})

test('should throw ResolveErrors returned by the variables', t => {
  const input = {
    foo: '${dummy:fatal}',
  }
  t.plan(1)
  return t.throws(resolveConfig(input, getScopes(), getTransformers()), FatalError)
})

function getScopes(): ObjectMap<Scope> {
  let waiting = true
  return {
    dummy: {
      resolve( name: string, ctx: Context ): Promise<Value> {
        switch (name) {
          case 'string':
            return Promise.resolve('hello')
          case 'number':
            return Promise.resolve(42)
          case 'waiting':
            if (waiting) {
              waiting = false
              const err = new DependencyError('waiting')
              return Promise.reject(err)
            } else {
              return Promise.resolve('done')
            }
          case 'fatal':
          default:
            return Promise.reject(new FatalError(`Cannot find ${name}`))
        }
      },
    },
  }
}

function getTransformers(): ObjectMap<Transformer> {
  return {}
}
