import { Config, Configuration } from '@midwayjs/core';
import { join } from 'path';
import { ITagDialectOption, ITagMysqlDialectOption } from '../../../../src';
import { MysqlTableName } from '../../../../src/dialect/mysql';
const mysql = require('mysql2');

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config.default'),
  ]
})
export class AutoConfiguration {
  connection;

  @Config()
  tags;

  async onConfigLoad(container) {
    let connection = mysql.createConnection({
      host: process.env.MYSQL_HOST || 'db4free.net',
      user: process.env.MYSQL_USER || 'tagsystest123',
      password: process.env.MYSQL_PASS || 'tagsystest123',
      database: process.env.MYSQL_DB || 'tagsystest123',
      charset: 'utf8',
    });
    let dialect: ITagMysqlDialectOption = {
      dialectType: 'mysql',
      sync: true,
      instance: {
        query: (...args) => {
          return connection.promise().query(...args);
        }
      }
    };
    try {
      // 清空表
      await connection.promise().query(`TRUNCATE TABLE \`tags_${MysqlTableName.Tag}\``);
      await connection.promise().query(`TRUNCATE TABLE \`tags_${MysqlTableName.Relationship}\``);
    } catch {}
     this.connection = connection;

     let newTagConfig: {[clientName: string]: ITagDialectOption} = {}
     Object.keys(this.tags).forEach(clientName => {
        newTagConfig[clientName] = dialect;
     });
     return {
      tags: newTagConfig
     }
  }

  async onStop() {
    // 清空表
    await this.connection.promise().query(`TRUNCATE TABLE \`tags_${MysqlTableName.Tag}\``);
    await this.connection.promise().query(`TRUNCATE TABLE \`tags_${MysqlTableName.Relationship}\``);
    this.connection.close();
  }
}
