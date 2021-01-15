import { EntityModel } from '../../../../../src';
import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './message';

@EntityModel('test_user')
export class User {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "name" })
  name: string;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];
}