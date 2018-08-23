import {provide} from 'injection';

@provide()
export class UserService {

  async getUsers() {
    return new Promise(() => {
      setTimeout(() => {
        resolve(['harry', 'jiakun.du']);
      }, 100);
    });
  }

}
