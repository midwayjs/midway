import { CustomModuleDetector, Provide } from '@midwayjs/core';
import { defineConfiguration, useMainApp } from '@midwayjs/core/functional';
import * as Next from '../../../../src';
import * as Koa from '@midwayjs/koa';
import assert from 'node:assert';

@Provide()
class Test {
  async hello() {
    return 'Hello World';
  }
}

export default defineConfiguration({
  importConfigs: [
    {
      default: {
        koa: {
          keys: ['test'],
          port: 3000,
        },
        next: {
          dev: false,
        }
      },
    }
  ],
  imports: [Koa, Next],
  detector: new CustomModuleDetector({
    modules: [
      Test,
    ]
  }),
  onReady: async (container) => {
    assert(useMainApp());
  },
});
