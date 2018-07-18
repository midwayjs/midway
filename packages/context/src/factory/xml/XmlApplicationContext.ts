import * as _ from 'lodash';
import { IApplicationContext, IResource } from '../../interfaces';
import { BaseApplicationContext } from '../ApplicationContext';
import { XmlObjectDefinitionParser } from './XmlObjectDefinitionParser';
import { Resource } from '../../base/Resource';

export class XmlApplicationContext extends BaseApplicationContext {
  parser: XmlObjectDefinitionParser;

  constructor(baseDir: string, configLocations: string[], parent?: IApplicationContext) {
    super(baseDir, configLocations, parent);

    this.parser = new XmlObjectDefinitionParser(baseDir, this.registry);
  }

  async loadDefinitions(configLocations: string[]): Promise<void> {
    if (!_.isArray(configLocations)) {
      throw new Error('loadDefinitions fail configLocations is not array!');
    }

    for (let i = 0; i < configLocations.length; i++) {
      await this.load(new Resource(this.baseDir, configLocations[i]));
    }

    this.props = this.parser.configuration;
  }

  async load(res: IResource): Promise<void> {
    if (res.isDir()) {
      const resources = await res.getSubResources();
      for (let i = 0; i < resources.length; i++) {
        await this.load(resources[i]);
      }
    }
    if (res.isFile()) {
      await this.parser.load(res);
    }
    // TODO: if url
  }
}
