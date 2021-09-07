import { saveModule, attachClassMetadata } from '@midwayjs/decorator';
import * as request from 'request';
import * as path from 'path';
import * as os from 'os';
import { isPrimary } from '../utils/utils';
import * as qs from 'querystring';

export function RunInPrimary() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    saveModule('primary:primary', target.constructor);
    const sockFile = path.join(os.tmpdir(), 'midway-primary.sock');
    if (!isPrimary()) {
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
              if(err){
                reject(err);
                return;
              }
              resolve(body);
            }
          );
        });
      };
    }
    attachClassMetadata(
      'primary:primary:options',
      {
        name: `${target.constructor.name}_${propertyKey}`,
        value: descriptor.value,
      },
      target.constructor
    );
  };
}
