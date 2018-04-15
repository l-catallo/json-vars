# json-vars
[![Build Status](https://travis-ci.org/l-catallo/json-vars.svg?branch=master)](https://travis-ci.org/l-catallo/json-vars)

Enables the use of variables in JSON and JSON-like configuration files

### Example usage

```javascript
const jVars = require('json-vars')

const solver = new jVars.Solver()

const config = {
  foo: {
    bar: '${env:BAR|default("bar")}'
  },
  baz: 'foo.bar is equal to ${self:foo.bar}'
}

solver.resolve(config).then( res => console.log(res) )
// Output => { foo: { bar: 'bar' }, baz: 'foo.bar is equal to bar' }
```
