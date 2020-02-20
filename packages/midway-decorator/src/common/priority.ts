import { saveClassMetadata } from 'injection'

import { PRIORITY_KEY } from '../constant'


export function priority(priority: number): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(PRIORITY_KEY, priority, target)
  }
}
