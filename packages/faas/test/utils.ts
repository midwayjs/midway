import { IFaaSConfigurationOptions, Framework } from '../src';
import { join } from 'path';
import { create, close } from '@midwayjs/mock';

export async function creatStarter(name, options: Partial<IFaaSConfigurationOptions> = {}, Clz?): Promise<Framework> {
  return create(join(__dirname, 'fixtures', name), options, Clz || Framework)
}

export async function closeApp(framework) {
  return close(framework);
}
