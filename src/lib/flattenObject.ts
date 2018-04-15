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

  function recursion<T>( path: string, obj: T ): ObjectMap<any> {
    let flatObj = {}
    if (obj instanceof Array) {
      obj.forEach( (val, i) => {
        const newPath = `${path}[${i}]`
        flatObj = { ...flatObj, ...recursion(newPath, val)}
      })
    } else if (typeof obj === 'object') {
      for (let key in obj) {
        const newPath = (path === '') ? key : `${path}.${key}`
        const field = obj[key]
        flatObj = { ...flatObj, ...recursion(newPath, field) }
      }
    } else {
      flatObj[path] = obj
    }
    return flatObj;
  }

  return recursion('', obj);
}
