import { EntityModel } from '../../../../../src';
import { PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { User } from './user';

@EntityModel('test_msg')
export class Message {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: "test_user", referencedColumnName: "id" })
  sender?: User;

  @Column({ name: "msg_text" })
  text?: string;
}