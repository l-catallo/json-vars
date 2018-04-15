import test from 'ava'

import extractFieldASTs from '../../src/lib/extractFieldASTs'

test('should return a map of FieldASTs', t => {
  const input = {
    foo: {
      bar: '${env:VAR}',
    },
    baz: '${self:foo.bar}',
  }
  const expected = {
    'foo.bar': {
      raw: '${env:VAR}',
      variables: [{
        match: '${env:VAR}',
        scope: 'env',
        name: 'VAR',
        transformers: [],
      }],
    },
    'baz': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        scope: 'self',
        name: 'foo.bar',
        transformers: [],
      }]
    }
  }
  t.deepEqual(extractFieldASTs(input), expected)
})

test ('should ignore fields that are not strings', t => {
  const input = {
    foo: {
      bar: 42,
    },
    baz: '${self:foo.bar}',
  }
  const expected = {
    'baz': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        scope: 'self',
        name: 'foo.bar',
        transformers: [],
      }]
    }
  }
  t.deepEqual(extractFieldASTs(input), expected)

})

test ('should ignore fields that do not contain variables', t => {
  const input = {
    foo: {
      bar: 'some string',
    },
    baz: '${self:foo.bar}',
  }
  const expected = {
    'baz': {
      raw: '${self:foo.bar}',
      variables: [{
        match: '${self:foo.bar}',
        scope: 'self',
        name: 'foo.bar',
        transformers: [],
      }]
    }
  }
  t.deepEqual(extractFieldASTs(input), expected)
})
