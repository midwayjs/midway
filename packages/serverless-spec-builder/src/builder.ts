import { SpecStructure, Builder } from './interface';

export class SpecBuilder implements Builder {
  originData: SpecStructure;

  constructor(originData: SpecStructure) {
    this.originData = originData;
    this.validate();
    this.transform();
  }

  validate() {
    return true;
  }

  transform() {
    const serviceData = this.originData['service'];
    if (typeof serviceData === 'string') {
      this.originData['service'] = {
        name: serviceData,
      };
    }
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
    return this.originData['service'];
  }

  getLayers() {
    return this.originData['layers'];
  }

  getAggregation() {
    return this.originData['aggregation'];
  }

  getFunctionsRule() {
    return this.originData['functionsRule'];
  }

  toJSON(): any {
    const serviceData = this.originData['service'];
    if (typeof serviceData === 'string') {
      this.originData['service'] = {
        name: serviceData,
      };
    }

    return this.originData;
  }
}
