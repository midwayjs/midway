import { Column, Model } from "sequelize-typescript";
import { BaseTable } from "../../../../../src";

@BaseTable
export default class UserModel extends Model{
  @Column({
    comment: '名字'
  })
  name: string;
}
