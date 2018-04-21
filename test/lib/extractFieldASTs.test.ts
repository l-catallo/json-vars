import test from 'ava'

import extractFieldASTs from '../../src/lib/extractFieldASTs'

test('should return a map of FieldASTs', t => {
  const input = {
    baz: '${self:foo.bar}',
    foo: {
      bar: '${env:VAR}',
    },
  }
  const expected = {
    'baz': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }],
    },
    'foo.bar': {
      raw: '${env:VAR}',
      variables: [{
        match: '${env:VAR}',
        name: 'VAR',
        scope: 'env',
        transformers: [],
      }],
    },
  }
  t.deepEqual(extractFieldASTs(input), expected)
})

test ('should ignore fields that are not strings', t => {
  const input = {
    baz: '${self:foo.bar}',
    foo: {
      bar: 42,
    },
  }
  const expected = {
    baz: {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }],
    },
  }
  t.deepEqual(extractFieldASTs(input), expected)

})

test ('should ignore fields that do not contain variables', t => {
  const input = {
    baz: '${self:foo.bar}',
    foo: {
      bar: 'some string',
    },
  }
  const expected = {
    baz: {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }],
    },
  }
  t.deepEqual(extractFieldASTs(input), expected)
})
