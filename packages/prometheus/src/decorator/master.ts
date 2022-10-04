import { saveModule, attachClassMetadata } from '@midwayjs/core';
import * as request from 'request';
import * as path from 'path';
import * as os from 'os';
import { isMaster } from '../utils/utils';
import * as qs from 'querystring';

export function Master() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    saveModule('prometheus:master', target.constructor);
    const sockFile = path.join(os.tmpdir(), 'midway-master.sock');
    if (!isMaster()) {
      descriptor.value = (...args) => {
        const params = {
          path: `${target.constructor.name}_${propertyKey}`,
          params: JSON.stringify(args),
        };
        return new Promise((resolve, reject) => {
          request(
            {
              uri: `http://unix:${sockFile}:/?${qs.stringify(params)}`,
            },
            (err, res, body) => {
              resolve(body);
            }
          );
        });
      };
    }
    attachClassMetadata(
      'prometheus:master:options',
      {
        name: `${target.constructor.name}_${propertyKey}`,
        value: descriptor.value,
      },
      target.constructor
    );
  };
}
