
import * as path from 'path';
import { MessageSource } from '../../../src/base/MessageSource';
import { Resource } from '../../../src/base/Resource';

import { expect } from 'chai';

const dir = path.resolve(__dirname, '../../fixtures/app/locales');

describe('/test/unit/base/MessageSource', () => {
  it('message source test ok', async () => {
    const source = new MessageSource('zh-cn');
    const res = new Resource(dir, 'zh-cn.json');
    await source.load('zh-cn', res);
    await source.load('en', res.createRelative('en.json'));

    expect(source.getMessage('hello')).eq('这是一个测试');
    expect(source.getMessage('new', [], 'by name')).eq('by name');
    expect(source.getMessage('hello', [], '', 'en')).eq('this is hello en');
    expect(source.getMessage('this is', ['basic'])).eq('a test basic');
  });
  it('message source load dir should ok', async () => {
    const source = new MessageSource('zh-cn');
    const res = new Resource(dir, '.');
    await source.load('zh-cn', res);

    expect(source.getMessage('hello')).eq('这是一个测试');
    expect(source.getMessage('new', [], 'by name')).eq('by name');
    expect(source.getMessage('this is', ['basic'])).eq('a test basic');
    expect(source.getMessage('hello', [], '', 'en')).is.null;
  });
  it('message source load use file name should ok', async () => {
    const source = new MessageSource('zh-cn');
    const res = new Resource(dir, '.');
    await source.loadUseFileName(res);

    expect(source.getMessage('hello')).eq('这是一个测试');
    expect(source.getMessage('new', [], 'by name')).eq('by name');
    expect(source.getMessage('this is', ['basic'])).eq('a test basic');
    expect(source.getMessage('hello', [], '', 'en')).eq('this is hello en');
  });
});
