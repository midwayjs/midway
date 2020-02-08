import { IContainer } from 'injection';

export interface IContainerConfiguration {
  addImports(imports: string[], baseDir?: string);
  addImportObjects(importObjects: any[]);
  addImportConfigs(importConfigs: string[], baseDir: string);
  load(packageName: string);
  loadConfiguration(configuration: any, baseDir: string);
  getImportDirectory(): string[];
}

export interface IMidwayContainer extends IContainer {
  createConfiguration();
  getConfigService(): IConfigService;
  getEnvironmentService(): IEnvironmentService;
  getCurrentEnv(): string;
}

export interface IConfigService {
  add(configFilePaths: string[]);
  addObject(obj: object);
  load();
  getConfiguration(configKey?: string);
}

export interface IEnvironmentService {
  getCurrentEnvironment(): string;
  setCurrentEnvironment(environment: string);
}

export interface Middleware<T> {
  resolve: () => (context: T, next: () => Promise<any>) => any;
}
