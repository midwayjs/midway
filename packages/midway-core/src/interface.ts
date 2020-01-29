import { IContainer } from 'injection';

export interface IContainerConfiguration {
  addImports(imports: string[]);
  addImportObjects(importObjects: any[]);
  load(packageName: string);
  loadConfiguration(configuration: any);
  getImportDirectory(): string[];
}

export interface IMidwayContainer extends IContainer {
  createConfiguration();
}
