import { createModuleServerlessFramework } from '../src';
import { BaseFramework } from '@midwayjs/core';
import { Framework, Inject, MidwayFrameworkType } from '@midwayjs/decorator';
import { transformFrameworkToConfiguration } from '@midwayjs/mock';
import * as FaaS from '../src';

describe('test/util.test.ts', () => {
  it('should test createModuleServerlessFramework', async () => {
    class A {}
    class B {}

    @Framework()
    class MockFramework extends BaseFramework<any, any, any> {

      @Inject()
      faasFramework: FaaS.Framework;

      async applicationInitialize(options) {
        this.app = {};
        this.faasFramework.configure({
          applicationAdapter: {
            getApplication() {
              return this.app;
            },
            getFunctionName(): string {
              return 'a';
            },
            getFunctionServiceName(): string {
              return 'b';
            }
          }
        });

        await this.faasFramework.initialize();
      }

      configure(options: any): any {
      }

      run(): Promise<void> {
        return Promise.resolve(undefined);
      }

      getFrameworkType() {
        return MidwayFrameworkType.CUSTOM;
      }
    }
    const framework = await createModuleServerlessFramework({
      preloadModules: [
        A,
        B
      ],
      configurationModule: [
        transformFrameworkToConfiguration(MockFramework),
        FaaS
      ]
    });
    expect(framework.getApplicationContext()).toBeDefined();
  });
});
