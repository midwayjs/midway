import { Column, Model, Table } from '../../../../../src';

@Table({
  tableName: 'hello'
})
export class HelloModel extends Model {
  @Column({
    comment: '名字'
  })
  name: string;
}
