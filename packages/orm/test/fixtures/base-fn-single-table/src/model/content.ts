import { EntityModel } from '../../../../../src';
import { PrimaryGeneratedColumn, Column, TableInheritance } from 'typeorm'

@EntityModel()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Content {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;
}
