import { Provide, Inject } from '../../../../../../src';

@Provide()
export class BaseService {

  @Inject()
  userManager;

  async getInformation() {
    return this.userManager.getUser();
  }
}
