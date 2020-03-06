import { saveClassMetadata, LIFECYCLE_KEY, saveModule, saveProviderId } from '../common';
import { ObjectIdentifier } from '../interface';

export function LifeCycle(identifier?: ObjectIdentifier) {
  return (target: any) => {
    saveModule(LIFECYCLE_KEY, target);
    saveClassMetadata(LIFECYCLE_KEY, {}, target);
    saveProviderId(identifier, target);
  };
}
