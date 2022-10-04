import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { PhotoService } from '../service/photo';
import { UserService } from '../service/user';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  photoService: PhotoService

  @Get('/get_user')
  async getUser(@Query() uid: string) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  @Get('/get_photo')
  async getPhoto() {
    const photo = await this.photoService.findPhoto();
    return { success: true, message: 'OK', data: photo };
  }
}
