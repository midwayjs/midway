import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Message } from './message';

@Entity('test_user')
export class User {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "name" })
  name: string;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];
}


@Entity()
export class OriginUser extends BaseEntity  {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  age: number
}
