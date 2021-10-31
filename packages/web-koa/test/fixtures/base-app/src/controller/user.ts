import { ALL, Aspect, Controller, Get, Body, IMethodAspect, JoinPoint, Post, Provide } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';

export class BaseUserController {
}

@Provide()
@Controller('/user')
export class UserController extends BaseUserController {

  @Get('/catchThrow')
  async aspectFirstMethod() {
    throw new Error('my error');
  }

  @Post('/catchThrowWithValidate')
  @Validate()
  async aspectWithValidate(@Body(ALL) bodyData) {
    throw new Error('my post error');
  }
}

@Provide()
@Aspect(UserController)
export class AspectUserController implements IMethodAspect {
  afterThrow(joinPoint: JoinPoint, error: Error) {
    if (error) {
      throw new Error('my new error');
    }
  }
}
