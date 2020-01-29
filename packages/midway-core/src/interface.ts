import { IContainer } from 'injection';

export interface IContainerConfiguration {
  addImports(imports: string[]);
  addImportObjects(importObjects: any[]);
}

export interface IMidwayContainer extends IContainer {
  createConfiguration();
}
