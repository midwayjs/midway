import { saveClassMetadata } from 'injection';

import { PRIORITY_KEY } from '../constant';


export function priority(input: number): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    saveClassMetadata(PRIORITY_KEY, input, target);
  };
}
