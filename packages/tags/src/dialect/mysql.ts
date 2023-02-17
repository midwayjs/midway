import { TAG_ERROR } from '../error';
import {
  IMysqlQuery,
  ITagBindOptions,
  ITagDefine,
  ITagDialect,
  ITagDialectInstance,
  ITagItem,
  ITagListInstanceOptions,
  ITagListInstanceTagsOptions,
  ITagListResult,
  ITagMysqlDialectOption,
  ITagOperResult,
  ITagSearchOptions,
  ITagUnBindOptions,
  MATCH_TYPE,
} from '../interface';
import { error, formatMatchLike, getPageOpions, success } from '../utils';

export enum MysqlTableName {
  Tag = 'tag',
  Relationship = 'relationship',
}

export class MysqlDialect implements ITagDialect {
  private dialectOptions: ITagMysqlDialectOption;
  private name = 'tags';
  private query: IMysqlQuery;
  constructor(dialect: ITagMysqlDialectOption) {
    this.dialectOptions = dialect;
    this.query = this.dialectOptions.instance.query;
  }

  async ready(): Promise<void> {
    if (this.dialectOptions.sync) {
      await this.syncTable();
    }
  }

  getInstance(group: string): ITagDialectInstance {
    return new MysqlDialectInstance({
      group,
      query: this.dialectOptions.instance.query,
      getTableName: this.buildTableName.bind(this),
    });
  }

  private buildTableName(tableName) {
    const tableNameList = this.dialectOptions.tablePrefix
      ? [this.dialectOptions.tablePrefix, this.name]
      : [this.name];
    return tableNameList
      .concat(tableName)
      .join(this.dialectOptions.tableSeparator || '_');
  }

  private async syncTable() {
    // tag table
    await this.checkOrCreateTable(this.buildTableName(MysqlTableName.Tag), [
      '`group` varchar(32) NULL,',
      '`name` varchar(32) NULL,',
      '`descri` varchar(128) NULL,',
    ]);
    // relationship table
    await this.checkOrCreateTable(
      this.buildTableName(MysqlTableName.Relationship),
      '`tid` BIGINT unsigned NOT NULL,',
      '`oid` BIGINT unsigned NOT NULL,'
    );
  }

  private async checkOrCreateTable(tableName: string, tableColumn: string[]) {
    const [raws] = await this.query(`SHOW TABLES LIKE '${tableName}'`);
    if (raws.length) {
      return;
    }
    const createSql = `CREATE TABLE \`${tableName}\` (
      \`id\` BIGINT unsigned NOT NULL AUTO_INCREMENT,
      ${tableColumn.join('\n')}
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      \`update_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY (id)
    );`;
    await this.query(createSql);
  }
}

interface MysqlDialectInstanceOptions {
  group: string;
  getTableName: (str: string) => string;
  query: IMysqlQuery;
}

export class MysqlDialectInstance implements ITagDialectInstance {
  private group: string;
  private query: IMysqlQuery;
  private buildTableName: (str: string) => string;
  constructor(options: MysqlDialectInstanceOptions) {
    this.group = options.group;
    this.query = options.query;
    this.buildTableName = options.getTableName;
  }

  async new(tagDefine: ITagDefine): Promise<ITagOperResult> {
    const {
      ids: [existTagId],
    } = await this.getTags(tagDefine.name);
    if (existTagId) {
      return error(TAG_ERROR.EXISTS, {
        id: existTagId,
      });
    }
    const sql = `insert into ${this.buildTableName(
      MysqlTableName.Tag
    )} (\`group\`, \`name\`, \`descri\`) values (?, ?, ?)`;
    const [raws] = await this.query(sql, [
      this.group,
      tagDefine.name,
      tagDefine.desc,
    ]);
    if (!raws.insertId) {
      return error(TAG_ERROR.OPER_ERROR);
    }
    return success({
      id: raws.insertId,
    });
  }

  async remove(tagIdOrName: number): Promise<ITagOperResult> {
    const {
      ids: [existTagId],
    } = await this.getTags(tagIdOrName);
    if (!existTagId) {
      return error(TAG_ERROR.NOT_EXISTS, { id: tagIdOrName });
    }
    // 先删除 object tag，
    const removeRelationshipSql = `delete from ${this.buildTableName(
      MysqlTableName.Relationship
    )} where tid = ${existTagId}`;
    await this.query(removeRelationshipSql);
    const sql = `delete from ${this.buildTableName(
      MysqlTableName.Tag
    )} where id = ${existTagId}`;
    const [raws] = await this.query(sql);
    if (raws.affectedRows !== 1) {
      return error(TAG_ERROR.OPER_ERROR);
    }
    return success({ id: existTagId });
  }

  async update(
    tagIdOrName: number,
    params: Partial<ITagDefine>
  ): Promise<ITagOperResult> {
    const {
      ids: [existTagId],
    } = await this.getTags(tagIdOrName);
    if (!existTagId) {
      return error(TAG_ERROR.NOT_EXISTS, { id: tagIdOrName });
    }
    const fields = [];
    const placeholders = [];
    Object.keys(params).forEach(key => {
      if (key === 'group' || key === 'id') {
        return;
      }
      let updateKey = key;
      if (key === 'desc') {
        updateKey = 'descri';
      }
      fields.push(`\`${updateKey}\` = ?`);
      placeholders.push(params[key]);
    });
    const sql = `update ${this.buildTableName(
      MysqlTableName.Tag
    )} set ${fields.join(', ')} where id = ${existTagId}`;
    const [raws] = await this.query(sql, placeholders);
    if (raws.affectedRows !== 1) {
      return error(TAG_ERROR.OPER_ERROR);
    }
    return success({
      id: existTagId,
    });
  }
  async list(
    listOptions?: ITagSearchOptions
  ): Promise<ITagListResult<ITagItem>> {
    const { page, pageSize, tags = [], count } = listOptions;
    const { limit, offset } = getPageOpions(page, pageSize);
    const idList = [];
    const nameList = [];
    const placeholder = [this.group];
    for (const matchItem of tags) {
      if (typeof matchItem === 'number') {
        idList.push(matchItem);
      } else if (typeof matchItem === 'string') {
        nameList.push(matchItem);
      }
    }
    const condition = [
      idList.length ? `id in (${idList.join()})` : '',
      ...nameList.map((name: string) => {
        const { matchStart, matchEnd, text } = formatMatchLike(name);
        if (matchStart && matchEnd) {
          placeholder.push(text);
          return '`name` = ?';
        }
        placeholder.push(name);
        return '`name` like ?';
      }),
    ]
      .filter(v => !!v)
      .join(' or ');
    const selectSql = `select * from ${this.buildTableName(
      MysqlTableName.Tag
    )} where \`group\` = ?${
      condition ? ` and (${condition})` : ''
    } limit ${limit},${offset}`;
    const queryPromise = [this.query(selectSql, placeholder)];
    if (count) {
      const countSql = `select count(id) as total from ${this.buildTableName(
        MysqlTableName.Tag
      )} where \`group\` = ?${condition ? ` and (${condition})` : ''}`;
      queryPromise.push(this.query(countSql, placeholder));
    }
    const [selectRes, countRes] = await Promise.all(queryPromise).then(
      resultList => {
        return resultList.map(([raws]) => {
          return raws;
        });
      }
    );
    const returnResult: ITagListResult<ITagItem> = {
      list: selectRes.map(item => {
        item.desc = item.descri;
        delete item.descri;
        return item;
      }),
    };
    if (count) {
      returnResult.total = countRes[0].total;
    }
    return returnResult;
  }

  async bind(bindOptions?: ITagBindOptions): Promise<ITagOperResult> {
    const { tags, objectId, autoCreateTag } = bindOptions;
    const { ids, notExists } = await this.getTags(tags);
    if (notExists.id.length) {
      return error(TAG_ERROR.NOT_EXISTS, {
        id: notExists.id,
      });
    }
    if (notExists.name.length) {
      if (!autoCreateTag) {
        return error(TAG_ERROR.NOT_EXISTS, {
          id: notExists.name,
        });
      }
      const newTagIds = await Promise.all(
        notExists.name.map(async tag => {
          const { id } = await this.new({
            name: tag,
            desc: 'auto creat',
          });
          return id;
        })
      );
      ids.push(...newTagIds);
    }
    await Promise.all(
      ids.map(async tagId => {
        // TODO: 简单事务，检测是否存在关系
        await this.query(
          `insert into ${this.buildTableName(
            MysqlTableName.Relationship
          )} (\`tid\`, \`oid\`) values (?, ?)`,
          [tagId, objectId]
        );
      })
    );
    return success();
  }

  async unbind(unbindOptions: ITagUnBindOptions): Promise<ITagOperResult> {
    let removeRelationshipSql = `delete from ${this.buildTableName(
      MysqlTableName.Relationship
    )} where oid = ${unbindOptions.objectId}`;
    if (unbindOptions.tags?.length) {
      const { ids } = await this.getTags(unbindOptions.tags);
      removeRelationshipSql += ` and tid in (${ids.join(',')})`;
    }
    await this.query(removeRelationshipSql);
    return success();
  }

  async listObjects(
    listOptions?: ITagListInstanceOptions
  ): Promise<ITagListResult<number>> {
    const {
      page,
      pageSize,
      tags = [],
      count,
      type = MATCH_TYPE.Or,
    } = listOptions;
    const { limit, offset } = getPageOpions(page, pageSize);
    const { ids, notExists } = await this.getTags(tags);
    if (notExists.all.length) {
      return {
        list: [],
        total: 0,
      };
    }
    let sql = '';
    let countSql = '';
    if (tags.length === 1) {
      // for more high performance
      const sqlBase = `FROM ${this.buildTableName(
        MysqlTableName.Relationship
      )} where tid = ${ids[0]}`;
      sql = `SELECT oid ${sqlBase} limit ${limit},${offset}`;
      countSql = `SELECT count(*) as total ${sqlBase}`;
    } else {
      if (type === MATCH_TYPE.Or) {
        const sqlBase = `FROM ${this.buildTableName(
          MysqlTableName.Relationship
        )} where tid in (${ids.join(',')})`;
        sql = `SELECT distinct oid ${sqlBase} limit ${limit},${offset}`;
        countSql = `SELECT count(distinct oid) as total ${sqlBase}`;
      } else if (type === MATCH_TYPE.And) {
        sql = `SELECT oid FROM ${this.buildTableName(
          MysqlTableName.Relationship
        )} where tid in (${ids.join(',')}) group by oid HAVING COUNT(*) = ${
          ids.length
        } limit ${limit},${offset}`;
        countSql = `SELECT count(*) as total FROM (SELECT oid FROM ${this.buildTableName(
          MysqlTableName.Relationship
        )} where tid in (${ids.join(',')}) group by oid HAVING COUNT(*) = ${
          ids.length
        }) as list`;
      }
    }

    const queryPromises = [];
    queryPromises.push(this.query(sql));
    if (count) {
      queryPromises.push(this.query(countSql));
    }
    const [selectRes, countRes] = await Promise.all(queryPromises).then(
      resultList => {
        return resultList.map(([raws]) => {
          return raws;
        });
      }
    );
    const returnResult: ITagListResult<number> = {
      list: selectRes.map(item => {
        return item.oid;
      }),
    };
    if (count) {
      returnResult.total = countRes[0].total;
    }
    return returnResult;
  }

  async listObjectTags(
    listOptions?: ITagListInstanceTagsOptions
  ): Promise<ITagListResult<ITagItem>> {
    const { page, pageSize, objectId, count } = listOptions;
    const { limit, offset } = getPageOpions(page, pageSize);
    const sql = `select tid from ${this.buildTableName(
      MysqlTableName.Relationship
    )} where oid = ? limit ${limit},${offset}`;
    const queryPromises = [this.query(sql, [objectId])];
    if (count) {
      const sql = `select count(tid) as total from ${this.buildTableName(
        MysqlTableName.Relationship
      )} where oid = ?`;
      queryPromises.push(this.query(sql, [objectId]));
    }
    const [tagIdList, countRes] = await Promise.all(queryPromises).then(
      resultList => {
        return resultList.map(([raws]) => {
          return raws;
        });
      }
    );

    let tagList = [];
    if (tagIdList.length) {
      const { list } = await this.list({
        tags: tagIdList.map(raw => raw.tid),
      });
      tagList = list;
    }

    const returnResult: ITagListResult<ITagItem> = {
      list: tagList,
    };
    if (count) {
      returnResult.total = countRes[0].total;
    }
    return returnResult;
  }

  private async getTags(
    tagIdOrName: string | number | Array<string | number>
  ): Promise<{
    ids: number[];
    notExists: {
      id: number[];
      name: string[];
      all: Array<string | number>;
    };
  }> {
    const tags = [].concat(tagIdOrName);
    const idList = [];
    const nameList = [];
    const placeholder = [this.group];
    const keyMap = new Map();
    for (const tag of tags) {
      keyMap.set(tag, true);
      if (typeof tag === 'number') {
        idList.push(tag);
      } else if (typeof tag === 'string') {
        nameList.push('`name` = ?');
        placeholder.push(tag);
      }
    }

    const condition = [
      idList.length ? `id in (${idList.join()})` : '',
      ...nameList,
    ]
      .filter(v => !!v)
      .join(' or ');
    const sql = `select id,name from ${this.buildTableName(
      MysqlTableName.Tag
    )} where \`group\` = ?${condition ? ` and (${condition})` : ''}`;
    const [raws] = await this.query(sql, placeholder);
    const tagIds = raws.map(raw => {
      keyMap.delete(raw.id);
      keyMap.delete(raw.name);
      return raw.id;
    });
    const notExists: any = {
      id: [],
      name: [],
      all: [],
    };
    const notExistKeys = keyMap.keys();
    for (const key of notExistKeys) {
      notExists.all.push(key);
      if (typeof key === 'number') {
        notExists.id.push(key);
      } else if (typeof key === 'string') {
        notExists.name.push(key);
      }
    }
    notExists.all;
    return {
      ids: tagIds,
      notExists,
    };
  }
}
