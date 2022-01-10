import { camelCase, pascalCase } from '../../src';

describe('test/util/camelCase.test.ts', () => {
  it('camelCase with preserveConsecutiveUppercase option', () => {
    expect(camelCase('foo-BAR')).toEqual('fooBAR');
    expect(camelCase('Foo-BAR')).toEqual('fooBAR');
    expect(camelCase('fooBAR')).toEqual('fooBAR');
    expect(camelCase('fooBaR')).toEqual('fooBaR');
    expect(camelCase('FOÈ-BAR')).toEqual('FOÈBAR');
    expect(camelCase('--')).toEqual('');
    expect(camelCase('')).toEqual('');
    expect(camelCase('--__--_--_')).toEqual('');
    expect(camelCase('foo BAR?')).toEqual('fooBAR?');
    expect(camelCase('foo BAR!')).toEqual('fooBAR!');
    expect(camelCase('foo BAR$')).toEqual('fooBAR$');
    expect(camelCase('foo-BAR#')).toEqual('fooBAR#');
    expect(camelCase('XMLHttpRequest')).toEqual('XMLHttpRequest');
    expect(camelCase('AjaxXMLHttpRequest')).toEqual('ajaxXMLHttpRequest');
    expect(camelCase('Ajax-XMLHttpRequest')).toEqual('ajaxXMLHttpRequest');
    expect(camelCase('mGridCOl6@md')).toEqual('mGridCOl6@md');
    expect(camelCase('A::a')).toEqual('a::a');
    expect(camelCase('Hello1WORLD')).toEqual('hello1WORLD');
    expect(camelCase('Hello11WORLD')).toEqual('hello11WORLD');
    expect(camelCase('РозовыйПушистыйFOOдинорогиf')).toEqual(
      'розовыйПушистыйFOOдинорогиf'
    );
    expect(camelCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(camelCase('桑德_在这里。')).toEqual('桑德在这里。');
  });

  it('camelCase with both pascalCase and preserveConsecutiveUppercase option', () => {
    expect(pascalCase('foo-BAR')).toEqual('FooBAR');
    expect(pascalCase('fooBAR')).toEqual('FooBAR');
    expect(pascalCase('fooBaR')).toEqual('FooBaR');
    expect(pascalCase('fOÈ-BAR')).toEqual('FOÈBAR');
    expect(pascalCase('--foo.BAR')).toEqual('FooBAR');
    expect(pascalCase('--')).toEqual('');
    expect(pascalCase('')).toEqual('');
    expect(pascalCase('--__--_--_')).toEqual('');
    expect(pascalCase('foo BAR?')).toEqual('FooBAR?');
    expect(pascalCase('foo BAR!')).toEqual('FooBAR!');
    expect(pascalCase('Foo BAR$')).toEqual('FooBAR$');
    expect(pascalCase('foo-BAR#')).toEqual('FooBAR#');
    expect(pascalCase('xMLHttpRequest')).toEqual('XMLHttpRequest');
    expect(pascalCase('ajaxXMLHttpRequest')).toEqual('AjaxXMLHttpRequest');
    expect(pascalCase('Ajax-XMLHttpRequest')).toEqual('AjaxXMLHttpRequest');
    expect(pascalCase('mGridCOl6@md')).toEqual('MGridCOl6@md');
    expect(pascalCase('A::a')).toEqual('A::a');
    expect(pascalCase('Hello1WORLD')).toEqual('Hello1WORLD');
    expect(pascalCase('Hello11WORLD')).toEqual('Hello11WORLD');
    expect(pascalCase('pозовыйПушистыйFOOдинорогиf')).toEqual(
      'PозовыйПушистыйFOOдинорогиf'
    );
    expect(pascalCase('桑德在这里。')).toEqual('桑德在这里。');
    expect(pascalCase('桑德_在这里。')).toEqual('桑德在这里。');
  });
});
