import { IMidwayApplication, IMidwayFramework } from '../interface';
import { FrameworkType, ScopeEnum, Provide, Scope } from '../decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayApplicationManager {
  private globalFrameworkMap = new Map<
    string,
    IMidwayFramework<any, any, any>
  >();

  private globalFrameworkTypeMap = new WeakMap<
    FrameworkType,
    IMidwayFramework<any, any, any>
  >();

  public addFramework(namespace, framework: IMidwayFramework<any, any, any>) {
    this.globalFrameworkMap.set(namespace, framework);
    if (framework['getFrameworkType']) {
      this.globalFrameworkTypeMap.set(
        framework['getFrameworkType'](),
        framework
      );
    }
  }

  public getFramework(namespaceOrFrameworkType: string | FrameworkType) {
    if (typeof namespaceOrFrameworkType === 'string') {
      if (this.globalFrameworkMap.has(namespaceOrFrameworkType)) {
        return this.globalFrameworkMap.get(namespaceOrFrameworkType);
      }
    } else {
      if (this.globalFrameworkTypeMap.has(namespaceOrFrameworkType)) {
        return this.globalFrameworkTypeMap.get(namespaceOrFrameworkType);
      }
    }
  }

  public getApplication(
    namespaceOrFrameworkType: string | FrameworkType
  ): IMidwayApplication {
    if (typeof namespaceOrFrameworkType === 'string') {
      if (this.globalFrameworkMap.has(namespaceOrFrameworkType)) {
        return this.globalFrameworkMap
          .get(namespaceOrFrameworkType)
          .getApplication();
      }
    } else {
      if (this.globalFrameworkTypeMap.has(namespaceOrFrameworkType)) {
        return this.globalFrameworkTypeMap
          .get(namespaceOrFrameworkType)
          .getApplication();
      }
    }
  }

  public getApplications(
    namespaces?: Array<string | FrameworkType>
  ): IMidwayApplication[] {
    if (!namespaces) {
      return Array.from(this.globalFrameworkMap.values()).map(framework => {
        return framework.getApplication();
      });
    } else {
      return namespaces
        .map(namespace => {
          return this.getApplication(namespace);
        })
        .filter(app => {
          return !!app;
        });
    }
  }
}
