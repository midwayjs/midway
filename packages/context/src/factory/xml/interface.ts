/**
 * xml 解析节点使用的接口定义
 */

import { IObjectDefinition, IResource, IManagedInstance } from '../../interfaces';

export interface IXmlParser {
  baseDir: string;
  parse(root: Element, context: IParserContext): Promise<void>;
  registerDefinition(definition: IObjectDefinition);
}

export interface IParserContext {
  defaults: IObjectDefinition;
  currentResource: IResource;
  parser: IXmlParser;
}

export interface IObjectDefinitionParser {
  readonly name: string;
  parse(ele: Element, context: IParserContext): IObjectDefinition;
}

export interface IManagedParser {
  readonly name: string;
  parse(ele: Element, context: IParserContext): IManagedInstance;
}
