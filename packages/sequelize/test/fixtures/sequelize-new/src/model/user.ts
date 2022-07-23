import { Column, Model, Table } from '../../../../../src';

@Table
export class UserModel extends Model {
  @Column({
    comment: '名字'
  })
  name: string;
}
