import { camelCase, pascalCase } from '../../src';

describe('test/util/camelCase.test.ts', () => {
  it('camelCase', () => {
    expect(camelCase('foo-BAR')).toEqual('fooBar');
    expect(camelCase('Foo-BAR')).toEqual('fooBar');
    expect(camelCase('fooBAR')).toEqual('fooBar');
    expect(camelCase('fooBaR')).toEqual('fooBaR');
    expect(camelCase('FOÈ-BAR')).toEqual('foèBar');
    expect(camelCase('--')).toEqual('');
    expect(camelCase('')).toEqual('');
    expect(camelCase('--__--_--_')).toEqual('');
    expect(camelCase('foo BAR?')).toEqual('fooBar?');
    expect(camelCase('foo BAR!')).toEqual('fooBar!');
    expect(camelCase('foo BAR$')).toEqual('fooBar$');
    expect(camelCase('foo-BAR#')).toEqual('fooBar#');
    expect(camelCase('XMLHttpRequest')).toEqual('xmlHttpRequest');
    expect(camelCase('AjaxXMLHttpRequest')).toEqual('ajaxXmlHttpRequest');
    expect(camelCase('Ajax-XMLHttpRequest')).toEqual('ajaxXmlHttpRequest');
    expect(camelCase('mGridCOl6@md')).toEqual('mGridCOl6@md');
    expect(camelCase('A::a')).toEqual('a::a');
    expect(camelCase('Hello1WORLD')).toEqual('hello1World');
    expect(camelCase('Hello11WORLD')).toEqual('hello11World');
    expect(camelCase('РозовыйПушистыйFOOдинорогиf')).toEqual(
      'розовыйПушистыйFoOдинорогиf'
    );
    expect(camelCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(camelCase('桑德_在这里。')).toEqual('桑德在这里。');
  });

  it('pascalCase case', () => {
    expect(pascalCase('foo-BAR')).toEqual('FooBar');
    expect(pascalCase('fooBAR')).toEqual('FooBar');
    expect(pascalCase('fooBaR')).toEqual('FooBaR');
    expect(pascalCase('fOÈ-BAR')).toEqual('FOèBar');
    expect(pascalCase('--foo.BAR')).toEqual('FooBar');
    expect(pascalCase('--')).toEqual('');
    expect(pascalCase('')).toEqual('');
    expect(pascalCase('--__--_--_')).toEqual('');
    expect(pascalCase('foo BAR?')).toEqual('FooBar?');
    expect(pascalCase('foo BAR!')).toEqual('FooBar!');
    expect(pascalCase('Foo BAR$')).toEqual('FooBar$');
    expect(pascalCase('foo-BAR#')).toEqual('FooBar#');
    expect(pascalCase('xMLHttpRequest')).toEqual('XMlHttpRequest');
    expect(pascalCase('ajaxXMLHttpRequest')).toEqual('AjaxXmlHttpRequest');
    expect(pascalCase('Ajax-XMLHttpRequest')).toEqual('AjaxXmlHttpRequest');
    expect(pascalCase('mGridCOl6@md')).toEqual('MGridCOl6@md');
    expect(pascalCase('A::a')).toEqual('A::a');
    expect(pascalCase('Hello1WORLD')).toEqual('Hello1World');
    expect(pascalCase('Hello11WORLD')).toEqual('Hello11World');
    expect(pascalCase('pозовыйПушистыйFOOдинорогиf')).toEqual(
      'PозовыйПушистыйFoOдинорогиf'
    );
    expect(pascalCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(pascalCase('桑德_在这里。')).toEqual('桑德在这里。');
  });
});
