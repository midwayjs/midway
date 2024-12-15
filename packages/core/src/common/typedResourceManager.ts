import { ClassType } from '../interface';

export class TypedResourceManager<
  Resource = any,
  ResourceInitializeConfig = any,
  ResourceProviderType = any
> {
  private resourceMap: Map<string, Resource> = new Map();
  private resourceBindingMap: Map<string, any> = new Map();
  constructor(
    protected typedResourceInitializerOptions: {
      initializeValue: {
        [resourceName: string]: ResourceInitializeConfig;
      };
      initializeClzProvider: {
        [resourceName: string]: ClassType<ResourceProviderType>;
      };
      resourceInitialize: (
        resourceInitializeConfig: ResourceInitializeConfig,
        resourceName: string
      ) => Promise<Resource>;
      resourceBinding: (
        ClzProvider: ClassType<ResourceProviderType>,
        resourceInitializeConfig: ResourceInitializeConfig,
        resource: Resource,
        resourceName: string
      ) => Promise<any>;
      resourceStart: (
        resource: Resource,
        resourceInitializeConfig: ResourceInitializeConfig,
        resourceBindingResult?: any
      ) => Promise<void>;
      resourceDestroy: (
        resource: Resource,
        resourceInitializeConfig: ResourceInitializeConfig
      ) => Promise<void>;
    }
  ) {}

  public async createResource(
    resourceName: string,
    resourceInitializeConfig: ResourceInitializeConfig
  ) {
    const resource =
      await this.typedResourceInitializerOptions.resourceInitialize(
        resourceInitializeConfig,
        resourceName
      );
    this.resourceMap.set(resourceName, resource);
    return resource;
  }

  public async init() {
    for (const resourceName of Object.keys(
      this.typedResourceInitializerOptions.initializeValue
    )) {
      const resourceInitializeConfig =
        this.typedResourceInitializerOptions.initializeValue[resourceName];
      const ClzProvider =
        this.typedResourceInitializerOptions.initializeClzProvider[
          resourceName
        ];

      const resource = await this.createResource(
        resourceName,
        resourceInitializeConfig
      );

      const bindingResult =
        await this.typedResourceInitializerOptions.resourceBinding(
          ClzProvider,
          resourceInitializeConfig,
          resource,
          resourceName
        );
      if (bindingResult) {
        this.resourceBindingMap.set(resourceName, bindingResult);
      }
    }
  }

  public async startParallel() {
    const startPromises = [];
    for (const [resourceName, resource] of this.resourceMap.entries()) {
      startPromises.push(
        this.typedResourceInitializerOptions.resourceStart(
          resource,
          this.typedResourceInitializerOptions.initializeValue[resourceName],
          this.resourceBindingMap.get(resourceName)
        )
      );
    }
    await Promise.all(startPromises);
  }

  public async start() {
    for (const [resourceName, resource] of this.resourceMap.entries()) {
      await this.typedResourceInitializerOptions.resourceStart(
        resource,
        this.typedResourceInitializerOptions.initializeValue[resourceName],
        this.resourceBindingMap.get(resourceName)
      );
    }
  }

  public async destroyParallel() {
    const destroyPromises = [];
    for (const [resourceName, resource] of this.resourceMap.entries()) {
      destroyPromises.push(
        this.typedResourceInitializerOptions.resourceDestroy(
          resource,
          this.typedResourceInitializerOptions.initializeValue[resourceName]
        )
      );
    }
    await Promise.all(destroyPromises);
  }

  public async destroy() {
    for (const [resourceName, resource] of this.resourceMap.entries()) {
      await this.typedResourceInitializerOptions.resourceDestroy(
        resource,
        this.typedResourceInitializerOptions.initializeValue[resourceName]
      );
    }
    this.resourceMap.clear();
    this.resourceBindingMap.clear();
  }

  public getResource(resourceName: string): any {
    return this.resourceMap.get(resourceName);
  }
}
