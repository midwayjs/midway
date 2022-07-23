import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class UserModel extends Model {
  @Column({
    comment: '名字'
  })
  name: string;
}
