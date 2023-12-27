import * as path from 'path';
import { Bone } from '../../../../../src';
import { Context } from '@midwayjs/core';

export const keys = 'hakuna matata';

export const leoric = {
  dataSource: {
    custom: {
      dialect: 'sqlite',
      database: path.join(__dirname, '../../', 'database.sqlite'),
      models: ['**/model/*{.ts,.js}'],
      sync: true,
      logger: {
        logQuery(
          sql: string,
          duration: number,
          opts: { Model: typeof Bone & { ctx: Context }, command: string, connection: unknown }
        ) {
          const logger = opts.Model?.ctx?.logger;
          if (!logger) return;
          logger.info(`[leoric.${opts.command}]`, sql, { duration });
        },
      },
    },
  },
  defaultDataSourceName: 'custom',
}
