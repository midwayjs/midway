import { providerWrapper, IMidwayContainer } from '@midwayjs/core';
import { CONNECTION_KEY, GetConnection } from '.';

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
  },
  {
    id: 'orm:getTreeRepository',
    provider: getTreeRepository,
  },
  {
    id: 'orm:getMongoRepository',
    provider: getMongoRepository,
  },
  {
    id: 'orm:getCustomRepository',
    provider: getCustomRepository,
  },
]);
