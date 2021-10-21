import { attachClassMetadata } from '@midwayjs/decorator';
import { ENTITY_MODEL_KEY } from '../interface';

export function InjectEntityModel(modelKey: any) {
  return (target, propertyKey: string) => {
    attachClassMetadata(
      ENTITY_MODEL_KEY,
      {
        key: {
          modelKey,
        },
        propertyName: propertyKey,
      },
      target
    );
  };
}
