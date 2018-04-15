import test from 'ava'
import { ResolveError, ResolveErrorType } from '../../src/lib/ResolveError'

import Default from '../../src/transformers/Default'

test('should leave unchanged a succesful Promise', t => {
  return Default.transform(Promise.resolve(42), 'arg').then( r => {
    t.is(r, 42)
  })
})

test('should recover a failed Promise and return the provided argument', t => {
  return Default.transform(Promise.reject(''), 'arg').then( r => {
    t.is(r, 'arg')
  })
})

test('should throw a FATAL ResolveError if no argument is provided', async t => {
  const err = await t.throws(Default.transform(Promise.resolve('')), ResolveError)
  t.is((err as ResolveError).errorType, ResolveErrorType.FATAL)
})
