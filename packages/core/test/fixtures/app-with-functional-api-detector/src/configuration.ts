import { CommonJSFileDetector } from '../../../../src';
import { defineConfiguration } from '../../../../src/functional';

export default defineConfiguration({
  detector: new CommonJSFileDetector({
    pattern: ['**/api.ts'],
  }),
});
