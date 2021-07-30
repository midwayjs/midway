import { EntityModel } from '../../../../../src';
import { PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { User2 } from './user';

@EntityModel('test_msg')
export class Message {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @ManyToOne(type => User2)
  @JoinColumn({ name: "test_user", referencedColumnName: "id" })
  sender?: User2;

  @Column({ name: "msg_text" })
  text?: string;
}
