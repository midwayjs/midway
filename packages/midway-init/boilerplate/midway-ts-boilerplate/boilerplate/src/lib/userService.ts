import {provide} from 'midway';

@provide()
export class UserService {

  getUser() {
    return 'developer';
  }
}
