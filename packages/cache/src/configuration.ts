// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: 'cache',
  importConfigs: [join(__dirname, 'config')],
})
export class CacheConfiguration {}
