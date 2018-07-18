import { join } from 'path';
import { DOMParser } from 'xmldom';
import {
  IObjectDefinition,
  IResource,
  IObjectDefinitionRegistry
} from '../../interfaces';
import { XmlObjectDefinition } from './XmlObjectDefinition';
import { Resource } from '../../base/Resource';
import { KEYS } from '../common/constants';
import * as utils from './utils';
import { ObjectConfiguration } from '../../base/Configuration';
import { IXmlParser, IParserContext, IObjectDefinitionParser } from './interface';
import { XmlObjectElementParser } from './XmlObjectElementParser';

export class ParserContext extends Map implements IParserContext {
  defaults: IObjectDefinition;
  parser: XmlObjectDefinitionParser;
  currentResource: IResource;

  constructor(defaults: IObjectDefinition,
    parser: XmlObjectDefinitionParser) {
    super();

    this.defaults = defaults;
    this.parser = parser;
  }
}

export class XmlObjectDefinitionParser implements IXmlParser {
  private parsers = new Map<string, IObjectDefinitionParser>();
  private objectElementParser = new XmlObjectElementParser();
  baseDir: string;
  registry: IObjectDefinitionRegistry;
  configuration: ObjectConfiguration;

  constructor(baseDir: string, registry: IObjectDefinitionRegistry) {
    this.baseDir = baseDir;

    this.registry = registry;
    this.configuration = new ObjectConfiguration();
  }

  registerParser(parser: IObjectDefinitionParser): void {
    this.parsers.set(parser.name, parser);
  }

  removeParser(parser: IObjectDefinitionParser): void {
    this.parsers.delete(parser.name);
  }

  hasParser(name: string): boolean {
    return this.parsers.has(name);
  }

  getParser(name: string): IObjectDefinitionParser {
    return this.parsers.get(name);
  }

  registerDefinition(definition: IObjectDefinition): void {
    this.registry.registerDefinition(definition.id, definition);
  }

  async parse(root: Element, context: IParserContext): Promise<void> {
    if (utils.nodeNameEq(root, KEYS.OBJECTS_ELEMENT)) {
      await this.parseObjectsElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.IMPORT_ELEMENT)) {
      await this.parseImportElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.CONFIGURATION_ELEMENT)) {
      await this.parseConfigurationElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.OBJECT_ELEMENT)) {
      await this.parseObjectElement(root, context);
    } else {
      await this.parseCustomElement(root, context);
    }
  }

  async parseObjectsElement(ele: Element, context: IParserContext): Promise<void> {
    context.defaults = new XmlObjectDefinition(ele);
    // 需要拼上当前路径
    if (context.defaults.path) {
      context.defaults.path = join(this.baseDir, context.defaults.path);
    } else {
      context.defaults.path = this.baseDir;
    }

    await utils.eachSubElement(ele, async (node: Element) => {
      await this.parse(node, context);
    });
  }

  async parseObjectElement(ele: Element, context: IParserContext): Promise<void> {
    const definition = await this.objectElementParser.parse(ele, context);
    this.registerDefinition(definition);
  }

  async parseImportElement(ele: Element, context: IParserContext): Promise<void> {
    const rpath = utils.nodeAttr(ele, KEYS.RESOURCE_ATTRIBUTE);
    const external = utils.nodeAttr(ele, KEYS.EXTERNAL_ATTRIBUTE) === 'true';
    let res = this._createResource(rpath, external, context);
    await this.load(res);
  }

  async parseConfigurationElement(ele: Element, context: IParserContext): Promise<void> {
    const str = utils.nodeAttr(ele, KEYS.PATH_ATTRIBUTE);
    const paths = str.split(',');
    const external = utils.nodeAttr(ele, KEYS.EXTERNAL_ATTRIBUTE) === 'true';
    let res = this._createResource('.', external, context);

    for (let i = 0; i < paths.length; i++) {
      const cfg = await res.createRelative(paths[i]).getContentAsJSON();
      this.configuration.putObject(cfg);
    }
  }

  async parseCustomElement(ele: Element, context: IParserContext): Promise<void> {
    const name = utils.nodeName(ele);
    if (this.hasParser(name)) {
      const parser = this.getParser(name);
      const definition = await parser.parse(ele, context);
      this.registerDefinition(definition);
    }
  }

  async load(res: IResource): Promise<void> {
    const buf = await res.getContent();
    const doc: Document = new DOMParser().parseFromString(buf.toString(res.encoding));
    const context = new ParserContext(null, this);
    context.currentResource = res;
    await this.parse(doc.documentElement, context);
  }

  _createResource(path: string, external: boolean, context: IParserContext): IResource {
    // 外部模块内的import
    if (external) {
      return new Resource(this.baseDir, join('node_modules', path));
    }
    // 相对路径下的import
    if (context.currentResource) {
      return context.currentResource.createRelative(path);
    }

    throw new Error(`${path} is not found`);
  }
}
