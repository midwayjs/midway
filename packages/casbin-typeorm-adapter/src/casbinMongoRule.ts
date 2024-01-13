import { BaseEntity, Column, Entity, ObjectIdColumn } from 'typeorm';
import * as typeorm from 'typeorm';

interface NewObj {
  ObjectId: unknown;
}

interface OldObj {
  ObjectID: unknown;
}

declare type ExtractObjectID<T> = T extends NewObj
  ? T['ObjectId']
  : T extends OldObj
  ? T['ObjectID']
  : never;

@Entity()
export class CasbinMongoRule extends BaseEntity {
  @ObjectIdColumn()
  public id!: ExtractObjectID<typeof typeorm>;

  @Column({
    nullable: true,
  })
  public ptype!: string;

  @Column({
    nullable: true,
  })
  public v0!: string;

  @Column({
    nullable: true,
  })
  public v1!: string;

  @Column({
    nullable: true,
  })
  public v2!: string;

  @Column({
    nullable: true,
  })
  public v3!: string;

  @Column({
    nullable: true,
  })
  public v4!: string;

  @Column({
    nullable: true,
  })
  public v5!: string;

  @Column({
    nullable: true,
  })
  public v6!: string;
}
