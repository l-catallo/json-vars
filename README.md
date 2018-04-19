# json-vars
[![Build Status](https://travis-ci.org/l-catallo/json-vars.svg?branch=master)](https://travis-ci.org/l-catallo/json-vars)

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

If it's needed a Variable's name or a string Argument can be wrapped with
with single or double quotes, in which case any character is allowed.

###### Scope

The scope indicates to the Solver the context on which it should resolve the
variable's name

###### Transformer

A Transformer can modify the value coming from the scope before the final
substitution happens. If multiple Transformers are chained, they are applied
left to right

#### Nesting Variables

Variables can also be places inside a Variable's name or a string Argument, this
works only for unquoted strings.

So in `"${self:foo.${env:ENV_VAR}}"` the inner variable will be resolved and
replaced before the outer variale, while in `"${self:'foo.${env:ENV_VAR}'}"`
the outer variable's name will be left as is.

## Builtin Scopes and Transformers

#### Scopes

###### `env`
Resolves the variable against the current shell environment.

###### `self`
References another property of the current input object.

#### Transformers

###### `default(defaultValue)`
Recover failures and return `defaultValue`, otherwise it has no effect.
