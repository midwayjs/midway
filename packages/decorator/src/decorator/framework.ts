import { saveModule, FRAMEWORK_KEY } from '../';

export function Framework(): ClassDecorator {
  return (target: any) => {
    saveModule(FRAMEWORK_KEY, target);
  };
}
