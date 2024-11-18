import { Provide } from '@midwayjs/core';
import { InjectModel, WhereConditions } from '../../../../../../src';
import Post from '../model/post';


@Provide()
export class PostService {
  @InjectModel(Post, 'subsystem')
  Post: typeof Post;

  async get(conditions?: WhereConditions<typeof Post>) {
    return await this.Post.find(conditions || {});
  }

  async add(values) {
    return await this.Post.create(values);
  }

  async delete(conditions?: WhereConditions<typeof Post>) {
    return await this.Post.remove(conditions || {});
  }
}