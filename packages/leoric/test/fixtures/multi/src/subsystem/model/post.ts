import { Bone, Column, DataTypes } from '../../../../../../src';

export default class Post extends Bone {
  @Column()
  id: bigint;

  @Column()
  title: string;

  @Column(DataTypes.TEXT)
  content: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
