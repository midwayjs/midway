export interface ITagServiceInitOptions {
  group: string;
  dialect?: ITagDialect;
}


export type ITagDialectOption = {
  dialectType: 'memory'
} | ITagMysqlDialectOption | ITagUserDialect;

export interface ITagUserDialect {
  dialectType: string;
  dialect: ITagDialect
}
export type IMysqlQuery = (sql: string, placeholder?: any[]) => [any, any];
export interface ITagMysqlDialectOption {
  dialectType: 'mysql';
  // 自动同步表结构
  sync?: boolean; // auto create table
  // 表前缀
  tablePrefix?: string;
  // 表名分隔符
  tableSeparator?: string;
  // query 的实例
  instance: {
    query: IMysqlQuery;
  };
}

export interface ITagDefine {
  name: string;
  desc?: string;
}

export interface ITagItem extends ITagDefine {
  id: number;
  createAt: number;
  updateAt: number;
}

export abstract class ITagDialect {
  // 初始化
  abstract ready(): Promise<void>;
  // 获取实体
  abstract getInstance(instanceName: string): ITagDialectInstance;
}

export abstract class ITagDialectInstance {
  // 新增标签
  abstract new(tagDefine: ITagDefine): Promise<ITagOperResult>;
  // 删除标签
  abstract remove(tagIdOrName: number | string): Promise<ITagOperResult>;
  // 更新标签
  abstract update(tagIdOrName: number | string, params: Partial<ITagDefine>): Promise<ITagOperResult>;
  // 列举标签
  abstract list(listOptions?: ITagSearchOptions): Promise<ITagListResult<ITagItem>>;
  // 绑定实体
  abstract bind(bindOptions: ITagBindOptions): Promise<ITagOperResult>
  // 解绑实体
  abstract unbind(unbindOptions: ITagUnBindOptions): Promise<ITagOperResult>
  // 根据标签列举实体
  abstract listObjects(listOptions?: ITagListInstanceOptions): Promise<ITagListResult<number>>;
  // 根据实体获取标签
  abstract listObjectTags(listOptions?: ITagListInstanceTagsOptions): Promise<ITagListResult<ITagItem>>;
}

export interface ITagOperResult {
  success: boolean;
  message: string;
  id?: number;
}

export interface ITagListResult<ListType> {
  list: ListType[];
  total?: number;
}


export interface ITagSearchOptions extends ITagPages {
  tags?: Array<number | string>;
  type?: MATCH_TYPE;
}

export interface ITagPages {
  count?: boolean;
  pageSize?: number;
  page?: number;
}

export interface ITagBindOptions extends ITagInstance {
  // 标签列表
  tags: Array<number | string>,
  // 不存在标签的话自动创建标签，并绑定，默认为false
  autoCreateTag?: boolean;
}

export interface ITagUnBindOptions extends ITagInstance {
  // 解绑的多个标签
  tags: Array<number | string>
}

export interface ITagListInstanceTagsOptions extends ITagInstance, ITagPages{}

export interface ITagInstance {
  // 实体id
  objectId: number,
}

export enum MATCH_TYPE {
  // 交集
  And = 'and',
  // 并集
  Or = 'or',
}

export interface ITagListInstanceOptions extends ITagPages {
  tags?: Array<string|number>;
  count?: boolean;
  type?: MATCH_TYPE;
}