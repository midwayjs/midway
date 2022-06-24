import { IMidwayApplication } from '@midwayjs/core';
import * as request from 'supertest';

export function createHttpRequest<T extends IMidwayApplication<any>>(
  app: T
): request.SuperTest<request.Test> {
  if ((app as any).callback2) {
    return request((app as any).callback2());
  } else if ((app as any).callback) {
    return request((app as any).callback());
  } else {
    return request(app);
  }
}
