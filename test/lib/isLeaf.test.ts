import test from 'ava'
import { VariableAST } from '../../src/lib/types'

import isLeaf from '../../src/lib/isLeaf'

test('should recognise a leaf', t => {
  const leaf: VariableAST = {
    match: '${self:foo.string}',
    scope: 'self',
    name: 'foo.string',
    transformers: [],
  }
  t.true(isLeaf(leaf))
})

test('should recognise a non-leaf', t => {
  const nonLeaf: VariableAST = {
    match: '${env:BUILD_${self:foo.build}}',
    scope: 'env',
    name: {
      raw: 'BUILD_${self:foo.build}',
      variables: [{
        match: '${self:foo.build}',
        scope: 'self',
        name: 'foo.build',
        transformers: [],
      }],
    },
    transformers: []
  }
  t.false(isLeaf(nonLeaf))
})
