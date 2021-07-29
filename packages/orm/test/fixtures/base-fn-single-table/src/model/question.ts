import { Column } from 'typeorm';
import { Content } from './content';
import { ChildEntityModel } from '../../../../../src';

@ChildEntityModel()
export class Question extends Content {

  @Column()
  answersCount: number;

}
