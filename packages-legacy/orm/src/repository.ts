import { IMidwayContainer, providerWrapper } from '@midwayjs/core';
import { CONNECTION_KEY, GetConnection } from '.';
import { ScopeEnum } from '@midwayjs/core';

export function getRepository(context: IMidwayContainer, args?: any) {
  return clzz => {
    const getConnection = context.get<GetConnection>(CONNECTION_KEY);
    return getConnection().getRepository(clzz);
  };
}

export function getTreeRepository(context: IMidwayContainer, args?: any) {
  return clzz => {
    const getConnection = context.get<GetConnection>(CONNECTION_KEY);
    return getConnection().getTreeRepository(clzz);
  };
}

export function getMongoRepository(context: IMidwayContainer, args?: any) {
  return clzz => {
    const getConnection = context.get<GetConnection>(CONNECTION_KEY);
    return getConnection().getMongoRepository(clzz);
  };
}

export function getCustomRepository(context: IMidwayContainer, args?: any) {
  return clzz => {
    const getConnection = context.get<GetConnection>(CONNECTION_KEY);
    return getConnection().getCustomRepository(clzz);
  };
}

providerWrapper([
  {
    id: 'orm:getRepository',
    provider: getRepository,
    scope: ScopeEnum.Singleton,
  },
  {
    id: 'orm:getTreeRepository',
    provider: getTreeRepository,
    scope: ScopeEnum.Singleton,
  },
  {
    id: 'orm:getMongoRepository',
    provider: getMongoRepository,
    scope: ScopeEnum.Singleton,
  },
  {
    id: 'orm:getCustomRepository',
    provider: getCustomRepository,
    scope: ScopeEnum.Singleton,
  },
]);
