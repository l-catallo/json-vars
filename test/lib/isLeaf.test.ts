import test from 'ava'
import { VariableAST } from '../../src/lib/types'

import isLeaf from '../../src/lib/isLeaf'

test('should recognise a leaf', t => {
  const leaf: VariableAST = {
    match: '${self:foo.string}',
    name: 'foo.string',
    scope: 'self',
    transformers: [],
  }
  t.true(isLeaf(leaf))
})

test('should recognise a non-leaf', t => {
  const nonLeaf: VariableAST = {
    match: '${env:BUILD_${self:foo.build}}',
    name: {
      raw: 'BUILD_${self:foo.build}',
      variables: [{
        match: '${self:foo.build}',
        name: 'foo.build',
        scope: 'self',
        transformers: [],
      }],
    },
    scope: 'env',
    transformers: [],
  }
  t.false(isLeaf(nonLeaf))
})
