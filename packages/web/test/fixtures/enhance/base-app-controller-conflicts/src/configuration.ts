import { CommonJSFileDetector, Configuration } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector({
    conflictCheck: true,
  }),
})
export class MainConfiguration {}
