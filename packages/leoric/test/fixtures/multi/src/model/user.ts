import { Bone, Column } from '../../../../../src';

export default class User extends Bone {
  @Column()
  id: bigint;

  @Column()
  name: string;

  @Column()
  birthday: Date;

  @Column()
  createdAt: Date;

  get age(): number {
    const now = new Date();
    const then = this.birthday;
    const diff = now.getFullYear() - then.getFullYear();
    if (now.getMonth() >= then.getMonth() && now.getDate() >= then.getDate()) {
      return diff;
    }
    return diff - 1;
  }
}
