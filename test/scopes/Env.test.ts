import test from 'ava'
import { FatalError } from '../../src/lib/errors'
import { ObjectMap } from '../../src/lib/types'

import Env from '../../src/scopes/Env'

test('should return the correct environment variable', t => {
  const env = getFakeEnvScope()
  const res = env.resolve('FOO')
  t.plan(2)
  t.notThrows(res)
  return res.then( r => {
    t.is(r, 'bar')
  })
})

test(
  'should return a FATAL ResolveError if the environment variable is not defined',
  async t => {
  const env = getFakeEnvScope()
  t.plan(2)
  const err = await t.throws(env.resolve('NON_EXISTENT_VAR'))
  t.true(err instanceof FatalError)
})

function getFakeEnvScope( additionalEnv: ObjectMap<string> = {} ): Env {
  const env: ObjectMap<string> = {
    BAZ: '42',
    FOO: 'bar',
    ...additionalEnv,
  }
  return new Env(env)
}
