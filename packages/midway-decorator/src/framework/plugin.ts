import { attachClassMetadata } from 'injection'

import { PLUGIN_KEY } from '../constant'
import { attachConstructorDataOnClass } from '../utils'


export function plugin(identifier?: string) {
  return function(target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, PLUGIN_KEY, index)
    } else {
      let id = identifier

      if (! id) {
        id = targetKey
      }
      attachClassMetadata(PLUGIN_KEY, {
        key: id,
        propertyName: targetKey,
      }, target)
    }
  }
}
