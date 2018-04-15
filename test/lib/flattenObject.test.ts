import test from 'ava'

import flattenObject from '../../src/lib/flattenObject'

test('should flatten a simple object', t => {
  const input = {
    foo: {
      bar: 'some string',
      baz: 42,
    }
  }
  const expected = {
    'foo.bar': 'some string',
    'foo.baz': 42,
  }
  t.deepEqual(flattenObject(input), expected)
})

test('should flatten an object that contains an array', t => {
  const input = {
    foo: {
      bar: [ 'elem1', 'elem2' ],
      baz: 42
    }
  }
  const expected = {
    'foo.bar[0]': 'elem1',
    'foo.bar[1]': 'elem2',
    'foo.baz': 42,
  }
  t.deepEqual(flattenObject(input), expected)
})
