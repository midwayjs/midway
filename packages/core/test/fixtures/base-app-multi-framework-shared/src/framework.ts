import { Framework, MidwayFrameworkType, Provide } from '@midwayjs/decorator';
import { BaseFramework, CommonExceptionFilterUnion, CommonMiddlewareUnion,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework
} from '../../../../src';

@Provide()
@Framework()
class LightFramework extends BaseFramework<any, any, any> {
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.LIGHT;
  }

  async run(): Promise<void> {
  }

  configure() {
    return {};
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

@Provide()
@Framework()
export class CustomThirdFramework implements IMidwayFramework<any, any> {
  useMiddleware(Middleware: CommonMiddlewareUnion<any>) {
      throw new Error('Method not implemented.');
  }
  useFilter(Filter: CommonExceptionFilterUnion<any>) {
      throw new Error('Method not implemented.');
  }
  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }

  app: any;
  configurationOptions: any;

  configure() {
    return {};
  }

  createLogger(name: string, options) {
    return undefined;
  }

  getAppDir(): string {
    return '';
  }

  getApplication(): any {
    return undefined;
  }

  getApplicationContext() {
    return undefined;
  }

  getBaseDir(): string {
    return '';
  }

  getConfiguration(key?: string): any {
  }

  getCoreLogger() {
    return undefined;
  }

  getCurrentEnvironment(): string {
    return '';
  }

  getDefaultContextLoggerClass(): any {
  }

  getFrameworkName(): string {
    return '';
  }

  getLogger(name?: string) {
    return undefined;
  }

  getProjectName(): string {
    return '';
  }

  initialize(options: Partial<IMidwayBootstrapOptions>): Promise<void> {
    return Promise.resolve(undefined);
  }

  run(): Promise<void> {
    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
