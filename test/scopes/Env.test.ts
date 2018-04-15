import test from 'ava'
import ResolveError from '../../src/lib/ResolveError'
import { ResolveErrorType } from '../../src/lib/ResolveError'
import { ObjectMap } from '../../src/lib/types'

import Env from '../../src/scopes/Env'

test('should return the correct environment variable', t => {
  const env = getFakeEnvScope()
  const res = env.resolve('FOO')
  t.notThrows(res)
  return res.then( r => {
    t.is(r, 'bar')
  })
})

test(
  'should return a FATAL ResolveError if the environment variable is not defined',
  async t => {
  const env = getFakeEnvScope()
  const err = await t.throws(env.resolve('NON_EXISTENT_VAR'))
  t.true(err instanceof ResolveError)
  t.is((err as ResolveError).errorType, ResolveErrorType.FATAL)
})

function getFakeEnvScope( additionalEnv: ObjectMap<string> = {} ): Env {
  const env: ObjectMap<string> = {
    FOO: 'bar',
    BAZ: '42',
    ...additionalEnv
  }
  return new Env(env)
}