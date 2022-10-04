import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from '../entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {
  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  async findPhoto () {
    let allPhotos = await this.photoModel.find();
    return allPhotos;
  }
}
