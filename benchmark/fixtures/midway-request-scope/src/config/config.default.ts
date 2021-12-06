import { join } from 'path';

export const keys = ['123321'];
/**
 * 单数据库实例
 */
export const orm = {
  type: 'sqlite',
  database: join(__dirname, '../../../user.sqlite3'),
  synchronize: false, // 如果第一次使用，不存在表，有同步的需求可以写 true
  logging: false,
};

export const koa = {
  port: 7001,
};
