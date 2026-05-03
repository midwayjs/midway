import { Options, Configuration, IDatabaseDriver } from '@mikro-orm/core';
import { type DataSourceManagerConfigOption } from '@midwayjs/core';

/**
 * Configuration shape for MikroORM v7 data sources managed by Midway.
 */
export type MikroConfigOptions<D extends IDatabaseDriver = IDatabaseDriver> =
  DataSourceManagerConfigOption<
    (Options<D> | Configuration<D>) & {
      logger?: string | ((message: string) => void);
    }
  >;
