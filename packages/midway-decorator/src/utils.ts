import { getParamNames, getClassMetadata, saveClassMetadata } from 'injection'

import { CLASS_KEY_CONSTRUCTOR } from './constant'


export function attachConstructorDataOnClass(identifier, clz, type, index) {
  let id = identifier

  if (! id) {
    const args = getParamNames(clz)
    if (clz.length === args.length && index < clz.length) {
      id = args[index]
    }
  }

  // save constructor index on class
  let constructorMetaValue = getClassMetadata(CLASS_KEY_CONSTRUCTOR, clz)
  if (! constructorMetaValue) {
    constructorMetaValue = {}
  }
  constructorMetaValue[index] = {
    key: id,
    type,
  }
  saveClassMetadata(CLASS_KEY_CONSTRUCTOR, constructorMetaValue, clz)
}
