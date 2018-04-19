import test from 'ava'
import { FatalError } from '../../src/lib/errors'

import recoverWith from '../../src/transformers/recoverWith'

test('should leave unchanged a succesful Promise', t => {
  t.plan(1)
  return recoverWith(Promise.resolve(42), 'arg').then( r => {
    t.is(r, 42)
  })
})

test('should recover a failed Promise and return the provided argument', t => {
  t.plan(1)
  return recoverWith(Promise.reject(''), 'arg').then( r => {
    t.is(r, 'arg')
  })
})

test('should throw a FATAL ResolveError if no argument is provided', async t => {
  t.plan(1)
  await t.throws(recoverWith(Promise.resolve('')), FatalError)
})
