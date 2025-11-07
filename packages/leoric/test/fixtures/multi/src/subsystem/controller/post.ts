import { Controller, Get, Inject } from "@midwayjs/core";
import { PostService } from "../service/post";

@Controller('/api/posts')
export class PostController {
  @Inject()
  postService: PostService;

  @Get('')
  async get() {
    const data = await this.postService.get();
    console.log(data);
    return data;
  }
}