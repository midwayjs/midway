import { Column } from 'typeorm';
import { Content } from './content';
import { ChildEntityModel } from '../../../../../src';

@ChildEntityModel()
export class Photo1 extends Content {

  @Column()
  size: string;

}
