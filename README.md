# json-vars
[![Build Status][build-img]][build-link]

[build-link]: https://travis-ci.org/l-catallo/json-vars
[build-img]: https://travis-ci.org/l-catallo/json-vars.svg?branch=master

Enables the use of variables in JSON and JSON-like configuration files

###### Install with

`npm i --save json-vars`

### Example usage

```javascript
const jVars = require('json-vars')

const config = {
  foo: {
    bar: '${env:BAR|default("bar")}'
  },
  baz: 'foo.bar is equal to ${self:foo.bar}'
}

jVars.resolve(config).then( res => console.log(res) )
// Output => {
//             foo: {
//               bar: 'bar'
//             },
//             baz: 'foo.bar is equal to bar'
//           }
```

## Syntax

###### Variable
![Variable syntax diagram](./assets/Variable.svg)

###### Transformer
![Transformer syntax diagram](./assets/Transformer.svg)

Scope, Variable and Transformer's names can contain any letter,
number, `-`, `.` or `_`.

An Argument can be any string, number or boolean. String Arguments can contain
the same character set of names.

If it's needed, a Variable's name or a string Argument can be wrapped in
single or double quotes, in which case any character is allowed.

###### Scope

The Scope indicates to `json-vars` the context on which it should resolve the
Variable's name.

###### Transformer

A Transformer can modify the value coming from the Scope before the final
substitution happens. If multiple Transformers are chained, they are applied
left to right.

#### Nesting Variables

Variables can also be placed inside a Variable's name or a string Argument, this
works only for unquoted strings.

So in `"${self:foo.${env:ENV_VAR}}"` the inner Variable will be resolved and
replaced before the outer variale, while in `"${self:'foo.${env:ENV_VAR}'}"`
the outer Variable's name will be left as is.

#### Variable interpolation

Once a Variable is resolved, its placeholder gets replaced with its resolved
value.

There are two possible replacement methods:
- If the Variable was contained in a longer string, the resolved value is
  stringified and then replaced.
- If the Variable's placeholder exactly match the string that contains it, the
  resolved value is returned as is and its type is preserved.

###### Example
```javascript
{
  "num": 42,
  "stringified": "num is ${self:num}",
  "preserved": "${self:num}"
}
// becomes
{
  "num": 42,
  "stringified": "num is 42",
  "preserved": 42
}
```

## Builtin Scopes and Transformers

#### Scopes

###### `env`
Resolves the Variable against the current shell environment.

###### `self`
References another property of the current input object.

#### Transformers

###### `default(<defaultValue>)`
Recover failures and return `defaultValue`, otherwise it has no effect.

## Running the tests

To run tests:

```sh
npm test
```

### And coding style tests

Run [NSP][nsp-link] and [TSLint][tslint-link]

[nsp-link]: https://nodesecurity.io/
[tslint-link]: https://palantir.github.io/tslint/

```sh
npm run lint
```
