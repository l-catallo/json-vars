import test from 'ava'

import isFieldAST from '../../src/lib/isFieldAST'

test('should recognise a valid object', t => {
  t.true(isFieldAST({
    raw: '${env:ENV}',
    variables: [{
      match: '${env:ENV}',
      name: 'ENV',
      scope: 'env',
      transformers: [],
    }]
  }))
})

test('null and undefined are not FieldASTs', t => {
  t.false(isFieldAST(null))
  t.false(isFieldAST(undefined))
})

test('scalars are not FieldASTs', t => {
  t.false(isFieldAST(false))
  t.false(isFieldAST(true))
  t.false(isFieldAST(42))
  t.false(isFieldAST('some string'))
})
