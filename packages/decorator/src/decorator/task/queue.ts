import { saveModule, saveClassMetadata } from '../../';
import { MODULE_TASK_QUEUE_KEY, MODULE_TASK_QUEUE_OPTIONS } from '../../constant';

export function Queue(options?: any) {
  return function (target) {
    saveModule(MODULE_TASK_QUEUE_KEY, target);
    saveClassMetadata(
      MODULE_TASK_QUEUE_OPTIONS,
      {
        options,
        name: target.name,
      },
      target
    );
  };
}
