import { SpecStructure, Builder } from './interface';

export class SpecBuilder implements Builder {

  originData: SpecStructure;

  constructor(originData: SpecStructure) {
    this.originData = originData;
    this.validate();
  }

  validate() {
    // TODO
  }

  getProvider() {
    return this.originData['provider'];
  }

  getFunctions() {
    return this.originData['functions'];
  }

  getResources() {
    return this.originData['resources'];
  }

  getPackage() {
    return this.originData['package'];
  }

  getPlugins() {
    return this.originData['plugins'];
  }

  getService() {
    const serviceData = this.originData['service'];
    if (typeof serviceData === 'string') {
      return {
        name: serviceData
      };
    } else {
      return serviceData;
    }
  }

  getLayers() {
    return this.originData['layers'];
  }

  toJSON(): object {
    return {
      service: this.getService(),
      provider: this.getProvider(),
      functions: this.getFunctions(),
      layers: this.getLayers(),
      resources: this.getResources(),
      plugins: this.getPlugins(),
      package: this.getPlugins()
    };
  }
}
