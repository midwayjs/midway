import { Column } from 'typeorm';
import { Content } from './content';
import { ChildEntityModel } from '../../../../../src';

@ChildEntityModel()
export class Photo extends Content {

  @Column()
  size: string;

}
