import { ScopeEnum, scope, provide } from '../../../src';

@scope(ScopeEnum.Singleton)
@provide('newKey')
export class DbAPI  {

}
