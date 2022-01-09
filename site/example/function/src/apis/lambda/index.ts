import { useContext } from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

function useKoaContext() {
  return useContext<Context>();
}

export default async () => {
  return {
    message: 'Hello World',
    method: useKoaContext().method,
  };
};

export const post = async (name: string) => {
  return { method: 'POST', name };
};
