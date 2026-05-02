import { ESModuleFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import { fixtureName } from './support.js';

export default defineConfiguration({
  namespace: 'fixture',
  detector: new ESModuleFileDetector({
    conflictCheck: true,
    ignore: ['configuration.ts', 'index.ts', 'support.ts'],
  }),
  async onReady(container) {
    container.registerObject('fixtureName', fixtureName);
  },
});
