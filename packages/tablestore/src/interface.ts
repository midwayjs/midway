// definition copy from @imhele/ots
import { Int64LE } from 'int64-buffer';

/**
 * protocol/proto_buffer
 */
export type ExtraMetadata = typeof INF_MIN & typeof INF_MAX & typeof PK_AUTO_INCR;
export type PrimaryKeyValue = Int64LE | string | Buffer;
export type ColumnValue = number | boolean | PrimaryKeyValue;
export type PrimaryKey = {
  [key: string]: PrimaryKeyValue | ExtraMetadata;
};

/**
 * metadata
 */
export enum RowExistenceExpectation {
  IGNORE = 0,
  EXPECT_EXIST = 1,
  EXPECT_NOT_EXIST = 2,
}

export enum Direction {
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
}

export enum UpdateType {
  PUT = 'PUT',
  DELETE = 'DELETE',
  DELETE_ALL = 'DELETE_ALL',
  INCREMENT = 'INCREMENT',
}

export enum ReturnType {
  NONE = 0,
  Primarykey = 1,
  AfterModify = 2,
}

export enum DefinedColumnType {
  DCT_INTEGER = 1,
  DCT_DOUBLE = 2,
  DCT_BOOLEAN = 3,
  DCT_STRING = 4,
}

export enum PrimaryKeyType {
  INTEGER = 1,
  STRING = 2,
  BINARY = 3,
}

export enum PrimaryKeyOption {
  AUTO_INCREMENT = 1,
}

export enum IndexUpdateMode {
  IUM_ASYNC_INDEX = 0,
  IUM_SYNC_INDEX = 1,
}

export enum IndexType {
  IT_GLOBAL_INDEX = 0,
  IT_LOCAL_INDEX = 1,
}

export const INF_MIN = {};
export const INF_MAX = {};
export const PK_AUTO_INCR = {};

/**
 * search
 *
 */
export enum QueryType {
  MATCH_QUERY = 1,
  MATCH_PHRASE_QUERY = 2,
  TERM_QUERY = 3,
  RANGE_QUERY = 4,
  PREFIX_QUERY = 5,
  BOOL_QUERY = 6,
  CONST_SCORE_QUERY = 7,
  FUNCTION_SCORE_QUERY = 8,
  NESTED_QUERY = 9,
  WILDCARD_QUERY = 10,
  MATCH_ALL_QUERY = 11,
  GEO_BOUNDING_BOX_QUERY = 12,
  GEO_DISTANCE_QUERY = 13,
  GEO_POLYGON_QUERY = 14,
  TERMS_QUERY = 15,
  EXISTS_QUERY = 16,
}

export enum ScoreMode {
  SCORE_MODE_NONE = 1,
  SCORE_MODE_AVG = 2,
  SCORE_MODE_MAX = 3,
  SCORE_MODE_TOTAL = 4,
  SCORE_MODE_MIN = 5,
}

export enum SortOrder {
  SORT_ORDER_ASC = 0,
  SORT_ORDER_DESC = 1,
}

export enum SortMode {
  SORT_MODE_MIN = 0,
  SORT_MODE_MAX = 1,
  SORT_MODE_AVG = 2,
}

export enum FieldType {
  LONG = 1,
  DOUBLE = 2,
  BOOLEAN = 3,
  KEYWORD = 4,
  TEXT = 5,
  NESTED = 6,
  GEO_POINT = 7,
}

export enum ColumnReturnType {
  RETURN_ALL = 1,
  RETURN_SPECIFIED = 2,
  RETURN_NONE = 3,
}

export enum GeoDistanceType {
  GEO_DISTANCE_ARC = 0,
  GEO_DISTANCE_PLANE = 1,
}

export enum IndexOptions {
  DOCS = 1,
  FREQS = 2,
  POSITIONS = 3,
  OFFSETS = 4,
}

export enum QueryOperator {
  OR = 1,
  AND = 2,
}

/**
 * params
 */

export interface CreateTableParams {
  tableMeta: {
    tableName: string;
    primaryKey: {
      name: string;
      type: PrimaryKeyType;
      option?: PrimaryKeyOption,
    }[];
    definedColumn?: {
      name: string;
      type: DefinedColumnType;
    }[];
  };
  reservedThroughput: {
    capacityUnit: {
      read: number;
      write: number;
    };
  };
  tableOptions?: {
    /**
     * 数据的过期时间, 单位秒, -1 代表永不过期. 假如设置过期时间为一年, 即为 365 * 24 * 3600.
     */
    timeToLive?: number;
    /**
     * 保存的最大版本数, 设置为 1 即代表每列上最多保存一个版本(保存最新的版本).
     */
    maxVersions?: number;
    maxTimeDeviation?: number;
  };
  streamSpecification?: {
    /**
     * globalIndex 不支持开启 Stream
     */
    enableStream?: boolean;
    expirationTime?: number;
  };
  indexMetas?: {
    name: string;
    primaryKey: string[];
    definedColumn: string[];
  }[];
}

export type ListTableParams = undefined | null | {};

export interface DeleteTableParams {
  tableName: string;
}

export interface UpdateTableParams {
  tableName: string;
  reservedThroughput: CreateTableParams['reservedThroughput'];
  tableOptions: CreateTableParams['tableOptions'];
  streamSpecification?: CreateTableParams['streamSpecification'];
}

export interface DescribeTableParams {
  tableName: string;
}

export interface ColumnCondition {
}

export interface GetRowParams {
  tableName: string;
  primaryKey: PrimaryKey[];
  /**
   * @default
   * 1
   */
  maxVersions?: number;
  columnFilter?: ColumnCondition;
  timeRange?: {
    startTime?: string;
    endTime?: string;
    specificTime?: string;
  };
  startColumn?: string;
  endColumn?: string;
  columnsToGet?: string[];
  transactionId?: string;
}

export type AttributeColumn = {
  [key: string]: ColumnValue;
  timestamp?: number;
};

export type UpdateColumn = {
  [key in UpdateType.DELETE_ALL]?: string[];
} & {
  [key in Exclude<UpdateType, UpdateType.DELETE_ALL>]?: AttributeColumn[];
};

export interface PutRowParams {
  tableName: string;
  primaryKey: PrimaryKey[];
  attributeColumns?: AttributeColumn[];
  condition?: TableStoreCondition | null;
  returnContent?: {
    returnType?: ReturnType;
  };
  transactionId?: string;
}

export interface UpdateRowParams {
  tableName: string;
  primaryKey: PrimaryKey[];
  updateOfAttributeColumns: UpdateColumn[];
  condition?: TableStoreCondition | null;
  returnContent?: {
    returnColumns?: string[];
    returnType?: ReturnType;
  };
  transactionId?: string;
}

export interface DeleteRowParams {
  tableName: string;
  primaryKey: PrimaryKey[];
  condition?: TableStoreCondition | null;
  returnContent?: {
    returnType?: ReturnType;
  };
  transactionId?: string;
}

export interface GetRangeParams {
  tableName: string;
  inclusiveStartPrimaryKey: PrimaryKey[];
  exclusiveEndPrimaryKey: PrimaryKey[];
  direction: Direction;
  maxVersions?: number;
  columnFilter?: ColumnCondition;
  limit?: number;
  timeRange?: {
    startTime?: string;
    endTime?: string;
    specificTime?: string;
  };
  startColumn?: string;
  endColumn?: string;
  columnsToGet?: string[];
  transactionId?: string;
}

export interface BatchGetRowParams {
  tables: {
    tableName: string;
    primaryKey: PrimaryKey[][];
    maxVersions?: number;
    columnFilter?: ColumnCondition;
    timeRange?: {
      startTime?: string;
      endTime?: string;
      specificTime?: string;
    };
    startColumn?: string;
    endColumn?: string;
    columnsToGet?: string[];
  }[];
  transactionId?: string;
}

export type BatchWriteRowItem = (
  | {
  type: 'PUT' | 'DELETE';
  attributeColumns?: AttributeColumn[];
}
  | {
  type: 'UPDATE';
  updateOfAttributeColumns: UpdateColumn[];
}) & {
  primaryKey: PrimaryKey[];
  condition?: TableStoreCondition | null;
  returnContent?: {
    returnType?: ReturnType;
    returnColumns?: string[];
  };
};

export interface BatchWriteRowParams {
  tables: {
    tableName: string;
    rows: BatchWriteRowItem[];
  }[];
  transactionId?: string;
}

export interface ListSearchIndexParams {
  tableName: string;
}

export interface DescribeSearchIndexParams {
  tableName: string;
  indexName: string;
}

export interface SearchIndexFieldSchema {
  fieldName: string;
  fieldType: FieldType;
  /**
   * 设置开启索引
   */
  index?: boolean;
  /**
   * 设置开启排序和统计功能
   */
  enableSortAndAgg?: boolean;
  store?: boolean;
  isAnArray?: boolean;
  indexOptions?: IndexOptions;
  analyzer?: string;
  fieldSchemas?: SearchIndexFieldSchema[];
}

export interface SearchIndexSetting {
  routingFields?: string[];
  routingPartitionSize?: number | null;
}

export type SearchIndexQuery =
  | {
  queryType?: QueryType.MATCH_QUERY;
  query?: {
    fieldName: string;
    text?: string;
    minimumShouldMatch?: number;
    operator?: QueryOperator;
  };
}
  | {
  queryType?: QueryType.MATCH_PHRASE_QUERY;
  query?: {
    fieldName: string;
    text?: string;
  };
}
  | {
  queryType?: QueryType.TERM_QUERY;
  query?: {
    fieldName: string;
    term: ColumnValue;
  };
}
  | {
  queryType?: QueryType.RANGE_QUERY;
  query?: {
    fieldName: string;
    rangeFrom?: ColumnValue;
    rangeTo?: ColumnValue;
    includeLower?: boolean;
    includeUpper?: boolean;
  };
}
  | {
  queryType?: QueryType.PREFIX_QUERY;
  query?: {
    fieldName: string;
    prefix?: string;
  };
}
  | {
  queryType?: QueryType.BOOL_QUERY;
  query?: {
    mustQueries?: SearchIndexQuery[];
    mustNotQueries?: SearchIndexQuery[];
    filterQueries?: SearchIndexQuery[];
    shouldQueries?: SearchIndexQuery[];
    minimumShouldMatch?: number;
  };
}
  | {
  queryType?: QueryType.CONST_SCORE_QUERY;
  query?: {
    filter: SearchIndexQuery;
  };
}
  | {
  queryType?: QueryType.FUNCTION_SCORE_QUERY;
  query?: {
    query: SearchIndexQuery;
    fieldValueFactor: { fieldName: string };
  };
}
  | {
  type?: QueryType.NESTED_QUERY;
  query?: {
    path: string;
    query: SearchIndexQuery;
    /**
     * @default
     * ScoreMode.SCORE_MODE_AVG
     */
    scoreMode?: ScoreMode;
  };
}
  | {
  queryType?: QueryType.WILDCARD_QUERY;
  query?: {
    fieldName: string;
    value?: string;
  };
}
  | {
  queryType?: QueryType.MATCH_ALL_QUERY;
  query?: {};
}
  | {
  queryType?: QueryType.GEO_BOUNDING_BOX_QUERY;
  query?: {
    fieldName: string;
    topLeft?: string;
    bottomRight?: string;
  };
}
  | {
  queryType?: QueryType.GEO_DISTANCE_QUERY;
  query?: {
    fieldName: string;
    centerPoint?: string;
    distance?: number;
  };
}
  | {
  queryType?: QueryType.GEO_POLYGON_QUERY;
  query?: {
    fieldName: string;
    points?: string[];
  };
}
  | {
  queryType?: QueryType.TERMS_QUERY;
  query?: {
    fieldName: string;
    terms?: ColumnValue[];
  };
}
  | {
  queryType?: QueryType.EXISTS_QUERY;
  query?: {
    fieldName: string;
  };
};

export interface SearchIndexNestedFilter {
  path?: string;
  filter?: SearchIndexQuery;
}

export interface SearchIndexSorter {
  fieldSort?: {
    fieldName: string;
    order?: SortOrder;
    mode?: SortMode;
    nestedFilter?: SearchIndexNestedFilter;
  };
  geoDistanceSort?: {
    fieldName: string;
    points?: string[];
    order?: SortOrder;
    mode?: SortMode;
    distanceType?: GeoDistanceType;
    nestedFilter?: SearchIndexNestedFilter;
  };
  scoreSort?: {
    order?: SortOrder;
  };
  primaryKeySort?: {
    order?: SortOrder;
  };
}

export interface SearchIndexSchema {
  fieldSchemas?: SearchIndexFieldSchema[];
  indexSetting?: SearchIndexSetting;
  indexSort?: {
    sorters: SearchIndexSorter[];
  };
}

export interface CreateSearchIndexParams {
  tableName: string;
  indexName: string;
  schema: SearchIndexSchema;
}

export interface DeleteSearchIndexParams {
  tableName: string;
  indexName: string;
}

export interface SearchQuery {
  offset: number;
  limit: number;
  getTotalCount?: boolean;
  token?: string;
  sort?: {
    sorters: SearchIndexSorter[];
  };
  query?: {
    queryType: QueryType
  }
}

export interface SearchParams {
  tableName: string;
  indexName: string;
  searchQuery: SearchQuery;
  columnToGet:
    | { returnType: ColumnReturnType; returnNames: string[] }
    | { returnType: Exclude<ColumnReturnType, ColumnReturnType.RETURN_SPECIFIED> };
  routingValues?: PrimaryKey[][];
}

export interface CreateIndexParams {
  mainTableName: string;
  indexMeta: {
    name: string;
    primaryKey: string[];
    definedColumn: string[];
    includeBaseData?: boolean;
    indexUpdateMode?: IndexUpdateMode;
    indexType?: IndexType;
  };
}

export interface DropIndexParams {
  mainTableName: string;
  indexName: string;
}

export interface StartLocalTransactionParams {
  tableName: string;
  primaryKey: PrimaryKey[];
}

export type CommitTransactionParams = string | { transactionId: string };
export type AbortTransactionParams = string | { transactionId: string };

export interface TableStoreResult {
  primaryKey: [
    {
      name: string;
      value: any;
    }
  ]
}

export interface TableStoreClient {
  /**********************************  表操作 开始 ******************************************/
  /**
   * 根据给定的表结构信息创建相应的表。
   */
  createTable<R = any>(params: CreateTableParams): Promise<R>;

  /**
   * 获取当前实例下已创建的所有表的表名。
   */
  listTable<R = any>(params: ListTableParams): Promise<R>;

  /**
   * 删除本实例下指定的表。
   */
  deleteTable<R = any>(params: DeleteTableParams): Promise<R>;

  /**
   * 更新指定表的预留读吞吐量或预留写吞吐量设置。
   */
  updateTable<R = any>(params: UpdateTableParams): Promise<R>;

  /**
   * 查询指定表的结构信息和预留读/写吞吐量设置信息。
   */
  describeTable<R = any>(params: DescribeTableParams): Promise<R>;

  /**********************************  表操作 结束 ******************************************/

  /**********************************  数据操作 开始 ******************************************/
  /**
   * 根据给定的主键读取单行数据。
   */
  getRow<R = any>(params: GetRowParams): Promise<R>;

  /**
   * 插入数据到指定的行，如果该行不存在，则新增一行；若该行存在，则覆盖原有行。
   */
  putRow<R = any>(params: PutRowParams): Promise<R>;

  /**
   * 更新指定行的数据。如果该行不存在，则新增一行；若该行存在，则根据请求的内容在这一行中新增、修改或者删除指定列的值。
   */
  updateRow<R = any>(params: UpdateRowParams): Promise<R>;

  /**
   * 删除一行数据。
   */
  deleteRow<R = any>(params: DeleteRowParams): Promise<R>;

  /**
   * 读取指定主键范围内的数据。
   */
  getRange<R = any>(params: GetRangeParams): Promise<R>;

  /**
   * 批量读取一个或多个表中的若干行数据。
   */
  batchGetRow<R = any>(params: BatchGetRowParams): Promise<R>;

  /**
   * 批量修改行
   */
  batchWriteRow<R = any>(params: BatchWriteRowParams): Promise<R>;

  /**
   * 获取表下所有SearchIndex索引名。
   */
  listSearchIndex<R = any>(params: ListSearchIndexParams): Promise<R>;

  /**
   * 获取SearchIndex索引描述信息。
   */
  describeSearchIndex<R = any>(params: DescribeSearchIndexParams): Promise<R>;

  /**
   * SearchIndex创建新索引。
   */
  createSearchIndex<R = any>(params: CreateSearchIndexParams): Promise<R>;

  /**
   * SearchIndex删除索引。
   */
  deleteSearchIndex<R = any>(params: DeleteSearchIndexParams): Promise<R>;

  /**
   * SearchIndex搜索。
   */
  search<R = any>(params: SearchParams): Promise<R>;

  /**
   * 创建GlobalIndex索引名。
   */
  createIndex<R = any>(params: CreateIndexParams): Promise<R>;

  /**
   * 删除GlobalIndex索引名。
   */
  dropIndex<R = any>(params: DropIndexParams): Promise<R>;

  /**
   * 创建局部事务
   */
  startLocalTransaction<R = any>(params: StartLocalTransactionParams): Promise<R>;

  /**
   * 提交事务
   */
  commitTransaction<R = any>(params: CommitTransactionParams): Promise<R>;

  /**
   * 丢弃事务
   */
  abortTransaction<R = any>(params: AbortTransactionParams): Promise<R>;
}

export enum FilterType {
  FT_SINGLE_COLUMN_VALUE = 1,
  FT_COMPOSITE_COLUMN_VALUE = 2,
  FT_COLUMN_PAGINATION = 3,
}

export enum LogicalOperator {
  NOT = 1,
  AND = 2,
  OR = 3,
}

export enum ColumnConditionType {
  COMPOSITE_COLUMN_CONDITION,
  SINGLE_COLUMN_CONDITION,
}

export enum ComparatorType {
  EQUAL = 1,
  NOT_EQUAL = 2,
  GREATER_THAN = 3,
  GREATER_EQUAL = 4,
  LESS_THAN = 5,
  LESS_EQUAL = 6,
}

export interface TableStoreCompositeCondition {
  sub_conditions: ColumnCondition[];

  getType(): FilterType.FT_COMPOSITE_COLUMN_VALUE;

  setCombinator(combinator: LogicalOperator): void;

  getCombinator(): LogicalOperator;

  addSubCondition(condition: ColumnCondition): void;

  clearSubCondition(): void;
}

export interface TableStoreCondition {
  columnCondition: ColumnCondition | null;
  rowExistenceExpectation: RowExistenceExpectation;

  setRowExistenceExpectation(rowExistenceExpectation: RowExistenceExpectation): void;

  getRowExistenceExpectation(): RowExistenceExpectation;

  setColumnCondition(columnCondition: ColumnCondition): void;

  getColumnCondition(): ColumnCondition;
}

export interface TableStoreLong {
  int64?: Int64LE;

  fromNumber(num: number): Int64LE;

  fromString(str: string): Int64LE;

  toBuffer(): Buffer;

  toNumber(): number;
}

export interface TableStoreSingleColumnCondition<T extends ColumnValue = ColumnValue> extends ColumnCondition {
  columnName: string;
  columnValue: T;
  comparator: ComparatorType;
  passIfMissing: boolean;
  latestVersionOnly: boolean;

  getType(): FilterType.FT_SINGLE_COLUMN_VALUE;

  /**
   * 设置 `passIfMissing`
   * 由于OTS一行的属性列不固定，有可能存在有condition条件的列在该行不存在的情况，这时
   * 参数控制在这种情况下对该行的检查结果。
   * 如果设置为True，则若列在该行中不存在，则检查条件通过。
   * 如果设置为False，则若列在该行中不存在，则检查条件失败。
   * 默认值为True。
   */
  setPassIfMissing(passIfMissing: boolean): void;

  getPassIfMissing(): boolean;

  setLatestVersionOnly(latestVersionOnly: boolean): void;

  getLatestVersionOnly(): boolean;

  setColumnName(columnName: string): void;

  getColumnName(): string;

  setColumnValue(columnValue: T): void;

  getColumnValue(): T;

  setComparator(comparator: ComparatorType): void;
}

export interface TableStoreConfig {
  accessKeyId: string;
  secretAccessKey?: string;
  accessKeySecret?: string;
  stsToken?: string;
  securityToken?: string;
  logger?: any;
  endpoint: string;
  httpOptions?: {
    timeout?: number;
    /**
     * @default
     * 300
     */
    maxSockets?: number;
  };
  maxRetries?: number;
  instancename: string;
  /**
   * @default
   * true
   */
  computeChecksums?: boolean;
}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    tableStore: ServiceFactoryConfigOption<TableStoreConfig>;
  }
}
