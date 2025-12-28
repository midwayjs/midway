import { CommonJSFileDetector } from '@midwayjs/core';
import * as piscina from '../../../../../src';
import { defineConfiguration } from '@midwayjs/core/functional';

/**
 * Worker 中的 Midway Configuration
 */
export default defineConfiguration({
  namespace: 'worker',
  detector: new CommonJSFileDetector(),
  imports: [piscina],
  async onReady() {
    console.log('[worker] Midway container ready in worker thread');
  }
});
