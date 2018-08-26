
import { IObjectDefinitionParser, IParserContext } from '../../../../src/factory/xml/interface';
import { IObjectDefinition } from '../../../../src/interfaces';
import { XmlObjectDefinition } from '../../../../src/factory/xml/XmlObjectDefinition';
import * as utils from '../../../../src/factory/xml/utils';
import { XmlObjectElementParser } from '../../../../src/factory/xml/XmlObjectElementParser';
import { KEYS } from '../../../../src/factory/common/constants';

export class MixinDefinitionParser implements IObjectDefinitionParser {
  readonly name: string = 'mixin';
  private eleParser = new XmlObjectElementParser();

  parse(ele: Element, context: IParserContext): IObjectDefinition {
    const definition = new XmlObjectDefinition(ele);

    utils.eachSubElementSync(ele, (node: Element) => {
      if (utils.nodeNameEq(node, KEYS.PROPERTY_ELEMENT)) {
        const name = utils.nodeAttr(node, KEYS.NAME_ATTRIBUTE);
        const managed = this.eleParser.parseElement(node, context);
        definition.properties.addProperty(name, managed);
      }
    });

    return definition;
  }
}
