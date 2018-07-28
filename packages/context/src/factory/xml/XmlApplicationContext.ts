import { IResource } from '../../interfaces';
import { BaseApplicationContext } from '../ApplicationContext';
import { XmlObjectDefinitionParser } from './XmlObjectDefinitionParser';
import { Resource } from '../../base/Resource';

export class XmlApplicationContext extends BaseApplicationContext {
  parser: XmlObjectDefinitionParser;

  protected init(): void {
    this.parser = new XmlObjectDefinitionParser(this.baseDir, this.registry);
  }

  loadDefinitions(configLocations: string[]): void {
    if (!Array.isArray(configLocations)) {
      throw new Error('loadDefinitions fail configLocations is not array!');
    }

    if (configLocations.length > 0) {
      for (let i = 0; i < configLocations.length; i++) {
        this.loadResource(new Resource(this.baseDir, configLocations[i]));
      }

      this.props.putAll(this.parser.configuration);
    }
  }

  loadResource(res: IResource): void {
    if (res.isDir()) {
      const resources = res.getSubResources();
      for (let i = 0; i < resources.length; i++) {
        this.loadResource(resources[i]);
      }
    }
    if (res.isFile()) {
      this.parser.load(res);
    }
    // TODO: if url
  }
}
