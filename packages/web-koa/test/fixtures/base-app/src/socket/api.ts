import {
  WSController,
  Provide,
  Inject,
  OnConnection,
  OnMessage,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@WSController('/')
export class APIController {

  @Inject()
  userService: UserService;

  @OnConnection()
  init(socket) {
    console.log('got a connection');
  }

  @OnMessage('my')
  gotMyMessage(socket) {
    console.log(socket);
  }
}
