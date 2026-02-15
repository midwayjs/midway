import { ApiClient } from '@midwayjs/api-bridge';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';

const MidwayApiClientContext = createContext<ApiClient<any, any> | null>(null);

export interface MidwayApiProviderProps {
  client: ApiClient<any, any>;
  children?: ReactNode;
}

export function MidwayApiProvider(props: MidwayApiProviderProps) {
  return createElement(
    MidwayApiClientContext.Provider,
    {
      value: props.client,
    },
    props.children
  );
}

export function useMidwayApiClient<TInput = unknown, TOutput = unknown>() {
  const client = useContext(MidwayApiClientContext);
  if (!client) {
    throw new Error(
      'useMidwayApiClient must be used inside <MidwayApiProvider />'
    );
  }
  return client as ApiClient<TInput, TOutput>;
}

export function useMidwayApiOperation<TInput = unknown, TOutput = unknown>(
  operationId: string
) {
  const client = useMidwayApiClient<TInput, TOutput>();
  return useCallback(
    (input: TInput) => {
      return client.call(operationId, input);
    },
    [client, operationId]
  );
}
