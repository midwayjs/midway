import { Controller, Get, Inject } from "@midwayjs/core";
import { PostService } from "../service/post";

@Controller('/api/posts')
export class PostController {
  @Inject()
  postService: PostService;

  @Get('')
  async get() {
    return await this.postService.get();
  }
}