import { ObjectIdentifier } from '../../interfaces';
import { ScopeEnum } from '../../base/Scope';
import { ObjectDefinition } from '../../base/ObjectDefinition';
import * as utils from './utils';

export class XmlObjectDefinition extends ObjectDefinition {
  private _ele: Element;

  constructor(ele: Element) {
    super();

    this._ele = ele;
    this._asynchronous = this.getAttr('async') === 'true';
    this._external = this.getAttr('external') === 'true';
    // external not autowire
    this._autowire = !this._external;
    if (this.hasAttr('autowire')) {
      if (this.getAttr('autowire') === 'false') {
        this._autowire = false;
      } else if (this.getAttr('autowire') === 'true') {
        this._autowire = true;
      }
    }
    this._direct = this.getAttr('direct') === 'true';
    this.path = this.getAttr('path');
    this.id = this.getAttr('id');
    this.name = utils.nodeName(this._ele);

    if (this.hasAttr('export')) {
      this.export = this.getAttr('export');
    }

    if (this.hasAttr('construct-method')) {
      this.constructMethod = this.getAttr('construct-method');
    }
    if (this.hasAttr('init-method')) {
      this.initMethod = this.getAttr('init-method');
    }
    if (this.hasAttr('destroy-method')) {
      this.destroyMethod = this.getAttr('destroy-method');
    }

    // default scope is singleton
    this.scope = ScopeEnum.Singleton;
    if (this.getAttr('scope') === 'request') {
      this.scope = ScopeEnum.Request;
    }
    if (this.getAttr('scope') === 'prototype') {
      this.scope = ScopeEnum.Prototype;
    }
    if (this.getAttr('scope') === 'singleton') {
      this.scope = ScopeEnum.Singleton;
    }

  }

  getAttr(key: ObjectIdentifier): any {
    return this._ele.getAttribute(<string>key);
  }

  hasAttr(key: ObjectIdentifier): boolean {
    return this._ele.hasAttribute(<string>key);
  }

  setAttr(key: ObjectIdentifier, value: any): void {
    this._ele.setAttribute(<string>key, value);
  }
}
