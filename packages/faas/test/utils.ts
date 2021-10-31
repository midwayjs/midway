import { Framework } from '../src';
import * as FaaS from '../src';
import { join } from 'path';
import { create, close } from '@midwayjs/mock';

export async function creatStarter(name, options?, Clz?): Promise<Framework> {
  return create<Framework>(join(__dirname, 'fixtures', name), options, FaaS);
}

export async function closeApp(framework) {
  return close(framework);
}
