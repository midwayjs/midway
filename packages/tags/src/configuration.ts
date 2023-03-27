import { Configuration } from '@midwayjs/core';
import { ITagDialectOption } from './interface';
import { TagServiceFactory } from './manager';

@Configuration({
  namespace: 'tags',
  importConfigs: [
    {
      default: {
        tags: {
          default: {
            dialectType: 'memory',
          } as ITagDialectOption,
        },
      },
    },
  ],
})
export class TagsConfiguration {
  async onReady(container) {
    await container.getAsync(TagServiceFactory);
  }
}
