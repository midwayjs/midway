import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { User } from './user';

@Entity('test_msg')
export class Message {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: "test_user", referencedColumnName: "id" })
  sender?: User;

  @Column({ name: "msg_text" })
  text?: string;
}
