import { IMidwayApplication, IMidwayFramework, ScopeEnum } from '../interface';
import { Provide, Scope } from '../decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayApplicationManager {
  private globalFrameworkMap = new Map<
    string,
    IMidwayFramework<any, any, any>
  >();

  public addFramework(
    frameworkNameOrNamespace: string,
    framework: IMidwayFramework<any, any, any>
  ) {
    this.globalFrameworkMap.set(frameworkNameOrNamespace, framework);
  }

  public hasFramework(frameworkNameOrNamespace: string) {
    return this.globalFrameworkMap.has(frameworkNameOrNamespace);
  }

  public getFramework(frameworkNameOrNamespace: string) {
    if (this.globalFrameworkMap.has(frameworkNameOrNamespace)) {
      return this.globalFrameworkMap.get(frameworkNameOrNamespace);
    }
  }

  public getApplication(frameworkNameOrNamespace: string): IMidwayApplication {
    if (this.globalFrameworkMap.has(frameworkNameOrNamespace)) {
      return this.globalFrameworkMap
        .get(frameworkNameOrNamespace)
        .getApplication();
    }
  }

  public getApplications(
    frameworkNameOrNamespace?: Array<string>
  ): IMidwayApplication[] {
    if (!frameworkNameOrNamespace) {
      return Array.from(this.globalFrameworkMap.values())
        .map(framework => {
          return framework.getApplication();
        })
        .filter(app => {
          return !!app;
        });
    } else {
      return frameworkNameOrNamespace
        .map(namespace => {
          return this.getApplication(namespace);
        })
        .filter(app => {
          return !!app;
        });
    }
  }
}
