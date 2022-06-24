import { Options, Configuration, IDatabaseDriver } from '@mikro-orm/core';
import { DataSourceManagerConfigOption } from '@midwayjs/core';

export type MikroConfigOptions<D extends IDatabaseDriver> = DataSourceManagerConfigOption<Options<D> | Configuration<D>>;
