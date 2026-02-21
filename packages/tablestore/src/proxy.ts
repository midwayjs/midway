import * as TableStore from 'tablestore';
import {
  ColumnCondition,
  ComparatorType,
  LogicalOperator,
  RowExistenceExpectation,
  TableStoreCompositeCondition,
  TableStoreCondition,
  TableStoreLong,
  TableStoreSingleColumnCondition,
} from './interface';

export class CompositeCondition extends TableStore.CompositeCondition {
  constructor(combinator: LogicalOperator) {
    super(combinator);
  }
}

export interface CompositeCondition extends TableStoreCompositeCondition {
  // empty
}

export class Condition extends TableStore.Condition {
  constructor(
    rowExistenceExpectation: RowExistenceExpectation,
    columnCondition?: ColumnCondition | null
  ) {
    super(rowExistenceExpectation, columnCondition);
  }
}

export interface Condition extends TableStoreCondition {
  // empty
}

export class SingleColumnCondition<T> extends TableStore.SingleColumnCondition {
  constructor(
    columnName: string,
    columnValue: T,
    comparator: ComparatorType,
    passIfMissing = true,
    latestVersionOnly = true
  ) {
    super(
      columnName,
      columnValue,
      comparator,
      passIfMissing,
      latestVersionOnly
    );
  }
}

export interface SingleColumnCondition<
  T,
> extends TableStoreSingleColumnCondition {
  // empty
}

export const Long = TableStore.Long as TableStoreLong;
