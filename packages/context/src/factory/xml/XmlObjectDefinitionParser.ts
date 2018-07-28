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

  parse(root: Element, context: IParserContext): void {
    if (utils.nodeNameEq(root, KEYS.OBJECTS_ELEMENT)) {
      this.parseObjectsElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.IMPORT_ELEMENT)) {
      this.parseImportElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.CONFIGURATION_ELEMENT)) {
      this.parseConfigurationElement(root, context);
    } else if (utils.nodeNameEq(root, KEYS.OBJECT_ELEMENT)) {
      this.parseObjectElement(root, context);
    } else {
      this.parseCustomElement(root, context);
    }
  }

  /**
   * 用于外部继承实现parse custom element内部使用
   * @param definition 当前definition
   * @param ele xml elemnt
   * @param context see ParserContext
   */
  parseElementNodes(definition: IObjectDefinition, ele: Element, context: IParserContext): void {
    utils.eachSubElementSync(ele, (node: Element) => {
      if (utils.nodeNameEq(node, KEYS.CONSTRUCTORARG_ELEMENT)) {
        utils.eachSubElementSync(node, (sele: Element) => {
          const managed = this.objectElementParser.parseElement(sele, context);
          definition.constructorArgs.push(managed);
        });
      } else if (utils.nodeNameEq(node, KEYS.PROPERTY_ELEMENT)) {
        const name = utils.nodeAttr(node, KEYS.NAME_ATTRIBUTE);
        const managed = this.objectElementParser.parseElement(node, context);
        definition.properties.addProperty(name, managed);
      }
    });
  }

  parseObjectsElement(ele: Element, context: IParserContext): void {
    context.defaults = new XmlObjectDefinition(ele);
    // 需要拼上当前路径
    if (context.defaults.path) {
      context.defaults.path = join(this.baseDir, context.defaults.path);
    } else {
      context.defaults.path = this.baseDir;
    }

    utils.eachSubElementSync(ele, (node: Element) => {
      this.parse(node, context);
    });
  }

  parseObjectElement(ele: Element, context: IParserContext): void {
    const definition = this.objectElementParser.parse(ele, context);
    this.registerDefinition(definition);
  }

  parseImportElement(ele: Element, context: IParserContext): void {
    const rpath = utils.nodeAttr(ele, KEYS.RESOURCE_ATTRIBUTE);
    const external = utils.nodeAttr(ele, KEYS.EXTERNAL_ATTRIBUTE) === 'true';
    let res = this._createResource(rpath, external, context);
    this.load(res);
  }

  parseConfigurationElement(ele: Element, context: IParserContext): void {
    const str = utils.nodeAttr(ele, KEYS.PATH_ATTRIBUTE);
    const paths = str.split(',');
    const external = utils.nodeAttr(ele, KEYS.EXTERNAL_ATTRIBUTE) === 'true';
    let res = this._createResource('.', external, context);

    for (let i = 0; i < paths.length; i++) {
      const cfg = res.createRelative(paths[i]).getContentAsJSON();
      this.configuration.putObject(cfg);
    }
  }

  parseCustomElement(ele: Element, context: IParserContext): void {
    const name = utils.nodeName(ele);
    if (this.hasParser(name)) {
      const parser = this.getParser(name);
      const definition = parser.parse(ele, context);
      this.registerDefinition(definition);
    }
  }

  load(res: IResource): void {
    const buf = res.getContent();
    const doc: Document = new DOMParser().parseFromString(buf.toString(res.encoding));
    const context = new ParserContext(null, this);
    context.currentResource = res;
    this.parse(doc.documentElement, context);
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
