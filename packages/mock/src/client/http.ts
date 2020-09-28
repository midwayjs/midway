import { IMidwayApplication } from '@midwayjs/core';
import * as request from 'supertest';

export function createHttpRequest(app: IMidwayApplication) {
  if ((app as any).callback) {
    return request((app as any).callback());
  } else {
    return request(app);
  }
}
