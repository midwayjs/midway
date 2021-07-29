import { Column } from 'typeorm';
import { Content } from './content';
import { ChildEntityModel } from '../../../../../src';

@ChildEntityModel()
export class Post extends Content {

  @Column()
  viewCount: number;

}
