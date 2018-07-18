/**
 * xml解析工具函数集合
 */

import { NODE_TYPE } from '../common/constants';

export function nodeAttr(ele: Element, name: string) {
  return ele.getAttribute(name).trim();
}

export function nodeText(ele: Element) {
  return ele.textContent.trim();
}

export function nodeHasAttr(ele: Element, name: string) {
  return ele.hasAttribute(name);
}

export function nodeNameEq(ele: Element, desiredName: string) {
  return ele.nodeName === desiredName || ele.localName === desiredName;
}

export function nodeName(ele: Element) {
  if (ele.nodeName && ele.nodeName.indexOf('#') === -1) {
    return ele.nodeName.trim();
  }

  if (ele.localName && ele.localName.indexOf('#') === -1) {
    return ele.localName.trim();
  }

  return '';
}

export type callback = (node: Element) => Promise<void>;
export type callbackSync = (node: Element) => void;
/**
 * 异步遍历element子节点
 * @param ele xml element节点
 * @param callback async function
 */
export async function eachSubElement(ele: Element, callback): Promise<void> {
  const childNodes = ele.childNodes;
  const len = childNodes.length;
  for (let i = 0; i < len; i++) {
    const node = childNodes.item(i);
    // element
    if (node.nodeType === NODE_TYPE.ELEMENT) {
      await callback(<Element>node);
    }
  }
}
/**
 * 同步遍历element子节点
 * @param ele xml element节点
 * @param callbackSync function
 */
export function eachSubElementSync(ele: Element, callbackSync): void {
  const childNodes = ele.childNodes;
  const len = childNodes.length;
  for (let i = 0; i < len; i++) {
    const node = childNodes.item(i);
    // element
    if (node.nodeType === NODE_TYPE.ELEMENT) {
      callbackSync(<Element>node);
    }
  }
}
/**
 * 获取第一个element类型子节点
 * @param ele xml element节点
 */
export function firstSubElement(ele: Element): Element {
  const childNodes = ele.childNodes;
  const len = childNodes.length;
  for (let i = 0; i < len; i++) {
    const node = childNodes.item(i);
    // element
    if (node.nodeType === NODE_TYPE.ELEMENT) {
      return <Element>node;
    }
  }

  return null;
}
/**
 * 获取第一个cdata类型子节点
 * @param ele xml element节点
 */
export function firstCDATAText(ele: Element): string {
  const childNodes = ele.childNodes;
  const len = childNodes.length;
  for (let i = 0; i < len; i++) {
    const node = childNodes.item(i);
    // element
    if (node.nodeType === NODE_TYPE.CDATA) {
      return node.textContent.trim();
    }
  }

  return '';
}
