// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  namespace: 'book',
  importConfigs: [join(__dirname, 'config')],
})
export class MainConfiguration {}
