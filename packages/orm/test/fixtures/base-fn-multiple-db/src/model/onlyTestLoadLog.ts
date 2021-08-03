import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { EntityModel } from '../../../../../src';

@EntityModel({
  connectionName: 'test',
})
export class OnlyTestLoadLog {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'content' })
  content: string;
}
