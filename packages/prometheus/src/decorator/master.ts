import { saveModule, attachClassMetadata } from "@midwayjs/decorator";
import * as request from "request";
import * as path from 'path';
import * as os from 'os';
import { isMaster } from "../utils/utils";
import * as qs from 'querystring'

export function Master() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    saveModule(`prometheus:master`, target.constructor);
    let sockFile = path.join(os.tmpdir(), 'midway-master.sock');
    if(isMaster()){
    }else{
      descriptor.value = (...args)=>{
        let params = {
          path: `${target.constructor.name}_${propertyKey}`,
          params: JSON.stringify(args)
        }
        return new Promise((resolve,reject)=>{
          request({
            uri: `http://unix:${sockFile}:/?${qs.stringify(params)}`
          }, (err, res, body)=>{
            resolve(body)
          })
        })
      }
    }
    attachClassMetadata(`prometheus:master:options`, {
      name: `${target.constructor.name}_${propertyKey}`,
      value: descriptor.value
    }, target.constructor);
  };
}
