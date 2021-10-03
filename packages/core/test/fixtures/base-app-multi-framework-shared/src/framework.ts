import { Framework, MidwayFrameworkType, Provide } from '@midwayjs/decorator';
import { BaseFramework, IMidwayApplication, IMidwayBootstrapOptions } from '../../../../src';

@Provide()
@Framework()
class LightFramework extends BaseFramework<any, any, any> {
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.LIGHT;
  }

  async run(): Promise<void> {
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }
}

@Provide()
@Framework()
export class CustomTwoFramework extends LightFramework {
  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_GRPC;
  }
}
