import { saveClassMetaData } from 'injection';
import { PRIORITY_KEY } from '../constant';

export function priority(priority: number): ClassDecorator {
  return (target: any) => {
    saveClassMetaData(PRIORITY_KEY, priority, target);
  };
}
