import {
  createContext,
  createElement,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';

interface MidwayApiClientLike {
  call(operationId: string, input: unknown): Promise<unknown>;
  has(operationId: string): Promise<boolean> | boolean;
  operationIds(): Promise<string[]> | string[];
}

const MidwayApiClientContext = createContext<MidwayApiClientLike | null>(null);

export interface MidwayApiProviderProps {
  client: MidwayApiClientLike;
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
  return client as {
    call(operationId: string, input: TInput): Promise<TOutput>;
    has(operationId: string): Promise<boolean> | boolean;
    operationIds(): Promise<string[]> | string[];
  };
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
