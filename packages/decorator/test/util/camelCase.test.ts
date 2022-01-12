import { Utils } from '../../src';

describe('test/util/camelCase.test.ts', () => {
  it('camelCase', () => {
    expect(Utils.camelCase('foo-BAR')).toEqual('fooBar');
    expect(Utils.camelCase('Foo-BAR')).toEqual('fooBar');
    expect(Utils.camelCase('fooBAR')).toEqual('fooBar');
    expect(Utils.camelCase('fooBaR')).toEqual('fooBaR');
    expect(Utils.camelCase('FOÈ-BAR')).toEqual('foèBar');
    expect(Utils.camelCase('--')).toEqual('');
    expect(Utils.camelCase('')).toEqual('');
    expect(Utils.camelCase('--__--_--_')).toEqual('');
    expect(Utils.camelCase('foo BAR?')).toEqual('fooBar?');
    expect(Utils.camelCase('foo BAR!')).toEqual('fooBar!');
    expect(Utils.camelCase('foo BAR$')).toEqual('fooBar$');
    expect(Utils.camelCase('foo-BAR#')).toEqual('fooBar#');
    expect(Utils.camelCase('XMLHttpRequest')).toEqual('xmlHttpRequest');
    expect(Utils.camelCase('AjaxXMLHttpRequest')).toEqual('ajaxXmlHttpRequest');
    expect(Utils.camelCase('Ajax-XMLHttpRequest')).toEqual('ajaxXmlHttpRequest');
    expect(Utils.camelCase('mGridCOl6@md')).toEqual('mGridCOl6@md');
    expect(Utils.camelCase('A::a')).toEqual('a::a');
    expect(Utils.camelCase('Hello1WORLD')).toEqual('hello1World');
    expect(Utils.camelCase('Hello11WORLD')).toEqual('hello11World');
    expect(Utils.camelCase('РозовыйПушистыйFOOдинорогиf')).toEqual(
      'розовыйПушистыйFoOдинорогиf'
    );
    expect(Utils.camelCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(Utils.camelCase('桑德_在这里。')).toEqual('桑德在这里。');
  });

  it('pascalCase case', () => {
    expect(Utils.pascalCase('foo-BAR')).toEqual('FooBar');
    expect(Utils.pascalCase('fooBAR')).toEqual('FooBar');
    expect(Utils.pascalCase('fooBaR')).toEqual('FooBaR');
    expect(Utils.pascalCase('fOÈ-BAR')).toEqual('FOèBar');
    expect(Utils.pascalCase('--foo.BAR')).toEqual('FooBar');
    expect(Utils.pascalCase('--')).toEqual('');
    expect(Utils.pascalCase('')).toEqual('');
    expect(Utils.pascalCase('--__--_--_')).toEqual('');
    expect(Utils.pascalCase('foo BAR?')).toEqual('FooBar?');
    expect(Utils.pascalCase('foo BAR!')).toEqual('FooBar!');
    expect(Utils.pascalCase('Foo BAR$')).toEqual('FooBar$');
    expect(Utils.pascalCase('foo-BAR#')).toEqual('FooBar#');
    expect(Utils.pascalCase('xMLHttpRequest')).toEqual('XMlHttpRequest');
    expect(Utils.pascalCase('ajaxXMLHttpRequest')).toEqual('AjaxXmlHttpRequest');
    expect(Utils.pascalCase('Ajax-XMLHttpRequest')).toEqual('AjaxXmlHttpRequest');
    expect(Utils.pascalCase('mGridCOl6@md')).toEqual('MGridCOl6@md');
    expect(Utils.pascalCase('A::a')).toEqual('A::a');
    expect(Utils.pascalCase('Hello1WORLD')).toEqual('Hello1World');
    expect(Utils.pascalCase('Hello11WORLD')).toEqual('Hello11World');
    expect(Utils.pascalCase('pозовыйПушистыйFOOдинорогиf')).toEqual(
      'PозовыйПушистыйFoOдинорогиf'
    );
    expect(Utils.pascalCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(Utils.pascalCase('桑德_在这里。')).toEqual('桑德在这里。');
  });
});
