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
    return this.originData['provider'] || {};
  }

  getCustom() {
    return this.originData['custom'];
  }

  getFunctions() {
    return this.originData['functions'];
  }

  getResources() {
    return this.originData['resources'];
  }

  getPackage() {
    return this.originData['package'] || {};
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
      return serviceData || {};
    }
  }

  getLayers() {
    return this.originData['layers'];
  }

  getAggregation() {
    return this.originData['aggregation'];
  }

  toJSON(): object {
    return {
      aggregation: this.getAggregation(),
      custom: this.getCustom(),
      functions: this.getFunctions(),
      layers: this.getLayers(),
      package: this.getPackage(),
      plugins: this.getPlugins(),
      provider: this.getProvider(),
      resources: this.getResources(),
      service: this.getService()
    };
  }
}
