import { saveClassMetadata, saveModule } from '@midwayjs/decorator';
import { ENTITY_MODEL_KEY, EntityOptions } from '../interface';

export function EntityModel(options?: EntityOptions): ClassDecorator {
  return (target: any) => {
    saveModule(ENTITY_MODEL_KEY, target);
    saveClassMetadata(ENTITY_MODEL_KEY, options, target);
  };
}
