import { Column, Model } from "sequelize-typescript";
import { BaseTable } from "../../../../../src";

@BaseTable({
  tableName: 'hello'
})
export default class HelloModel extends Model{
  @Column({
    comment: '名字'
  })
  name: string;
}
