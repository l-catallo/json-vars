import test from 'ava';
import { parse } from '../src/FieldParser';

/* Test cases are organized in arrays with the following structure
 * [ <description>, <input string>, <expected result> ]
 */
const testCases = [

  ['should leave unchanged a simple string', 'some random string', 'some random string'],

  [ 'should parse a simple Variable',
    '${env:SOME_ENV}',
    {
      raw: '${env:SOME_ENV}',
      variables: [{
        match: '${env:SOME_ENV}',
        name: 'SOME_ENV',
        scope: 'env',
        transformers: [],
      }],
    }
  ],

  [ 'should parse a variable in the middle of a string',
    'some ${self:foo.bar}string',
    {
      raw: 'some ${self:foo.bar}string',
      variables: [{
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }],
    }
  ],

  [ 'should parse a simple transformer',
    'some ${self:foo.bar|capitalize}string',
    {
      raw: 'some ${self:foo.bar|capitalize}string',
      variables: [{
        match: '${self:foo.bar|capitalize}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [{
          name: 'capitalize',
          args: [],
        }],
      }],
    }
  ],

  [ 'should parse transformers with arguments',
    'some ${self:foo.bar|ellipsize(30)|concat("baz")}string',
    {
      raw: 'some ${self:foo.bar|ellipsize(30)|concat("baz")}string',
      variables: [{
        match: '${self:foo.bar|ellipsize(30)|concat("baz")}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [{
          name: 'ellipsize',
          args: [30],
        }, {
          name: 'concat',
          args: ['baz'],
        }],
      }],
    }
  ],

  [ 'should parse multiple variables in the same string',
    'some ${env:ENV}random ${self:foo.bar}string${env:BUILD}',
    {
      raw: 'some ${env:ENV}random ${self:foo.bar}string${env:BUILD}',
      variables: [{
        match: '${env:ENV}',
        name: 'ENV',
        scope: 'env',
        transformers: [],
      }, {
        match: '${self:foo.bar}',
        name: 'foo.bar',
        scope: 'self',
        transformers: [],
      }, {
        match: '${env:BUILD}',
        name: 'BUILD',
        scope: 'env',
        transformers: [],
      }],
    }
  ],

  [ 'should parse nested variables in a variable\'s name',
    'some ${env:KEY_${self:foo.bar|capitalize}|decode64} key',
    {
      raw: 'some ${env:KEY_${self:foo.bar|capitalize}|decode64} key',
      variables: [{
        match: '${env:KEY_${self:foo.bar|capitalize}|decode64}',
        name: {
          raw: 'KEY_${self:foo.bar|capitalize}',
          variables: [{
            match: '${self:foo.bar|capitalize}',
            name: 'foo.bar',
            scope: 'self',
            transformers: [{
              name: 'capitalize',
              args: [],
            }],
          }],
        },
        scope: 'env',
        transformers: [{
          name: 'decode64',
          args: [],
        }],
      }],
    }
  ],

  [ 'should parse nested variables in a transformer\'s argument',
    'some numbers: ${self:foo.number|repeat(${self:foo.repeats})}\n',
    {
      raw: 'some numbers: ${self:foo.number|repeat(${self:foo.repeats})}\n',
      variables: [{
        match: '${self:foo.number|repeat(${self:foo.repeats})}',
        name: 'foo.number',
        scope: 'self',
        transformers: [{
          name: 'repeat',
          args: [{
            raw: '${self:foo.repeats}',
            variables: [{
              match: '${self:foo.repeats}',
              name: 'foo.repeats',
              scope: 'self',
              transformers: [],
            }]
          }],
        }]
      }]
    }
  ],

];

testCases.forEach( c => {
  test(c[0] as string, t => {
    t.deepEqual(parse(c[1] as string, {}), c[2]);
  })
})

