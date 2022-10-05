import {
  App,
  Configuration,
  Guard,
  IGuard,
  IMidwayApplication,
  Provide,
  UseGuard
} from '../../../../src';

@Guard()
export class MainGuard implements IGuard<any> {
  async canActivate(ctx: any): Promise<boolean> {
    return true;
  }
}

@Guard()
export class Main2Guard implements IGuard<any> {
  async canActivate(ctx: any): Promise<boolean> {
    return true;
  }
}

@Guard()
export class ClzGuard implements IGuard<any> {
  async canActivate(ctx: any): Promise<boolean> {
    return true;
  }
}

@Guard()
export class MethodGuard implements IGuard<any> {
  async canActivate(ctx: any): Promise<boolean> {
    return false;
  }
}

@Provide()
@UseGuard(ClzGuard)
export class UserService {
  async invoke() {
    return 'hello invoke';
  }

  @UseGuard(MethodGuard)
  async invoke2() {
    return 'hello invoke2';
  }
}

@Configuration()
export class MainConfiguration {
  @App()
  app: IMidwayApplication;

  async onReady() {
    this.app.useGuard(MainGuard);
    this.app.useGuard([Main2Guard]);

    const ctx = this.app.createAnonymousContext();
    const invokeResult = await this.app.getFramework().runGuard(ctx, UserService, 'invoke');

    this.app.setAttr('invokeResult', invokeResult);

    const invoke2Result = await this.app.getFramework().runGuard(ctx, UserService, 'invoke2');
    this.app.setAttr('invoke2Result', invoke2Result);
  }
}
