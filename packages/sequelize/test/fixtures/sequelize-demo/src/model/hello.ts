import { Column, Model, BaseTable } from '../../../../../src';

@BaseTable({
  tableName: 'hello'
})
export default class HelloModel extends Model {
  @Column({
    comment: '名字'
  })
  name: string;
}
