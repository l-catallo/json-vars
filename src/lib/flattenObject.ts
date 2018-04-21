import { ObjectMap } from './types'

/**
 * Takes an object and returns a map of its values with
 * the keys representing the path of each one
 *
 * @example
 * flattenObject({foo: {bar: 'baz'}})
 * // returns {
 * //   'foo.bar': 'baz'
 * // }
 *
 * flattenObject({foo: ['bar', 'baz']})
 * // returns {
 * //   'foo[0]': 'bar',
 * //   'foo[1]': 'baz'
 * // }
 *
 * @param {object} obj
 * @returns {ObjectMap<any>}
 */
export default function flattenObject( obj: object ): ObjectMap<any> {

  function recursion( path: string, currentValue: any ): ObjectMap<any> {
    let flatObj = {}
    if (currentValue instanceof Array) {
      currentValue.forEach( (val, i) => {
        const newPath = `${path}[${i}]`
        flatObj = { ...flatObj, ...recursion(newPath, val)}
      })
    } else if (typeof currentValue === 'object' && currentValue !== null) {
      Object.getOwnPropertyNames(currentValue).forEach( key => {
        const newPath = (path === '') ? key : `${path}.${key}`
        const field = currentValue[key]
        flatObj = { ...flatObj, ...recursion(newPath, field) }
      })
    } else {
      flatObj[path] = currentValue
    }
    return flatObj
  }

  return recursion('', obj)
}
