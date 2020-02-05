import { saveClassMetadata, PRIORITY_KEY } from '../common';

export function Priority(priority: number): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(PRIORITY_KEY, priority, target);
  };
}
