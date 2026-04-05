import { createClient } from '@midwayjs/web-bridge';
import {
  defineComponent,
  inject,
  provide,
  type InjectionKey,
  type Plugin,
} from 'vue';

export { createClient };

interface MidwayApiClientLike {
  call(operationId: string, input: unknown): Promise<unknown>;
  has(operationId: string): Promise<boolean> | boolean;
  operationIds(): Promise<string[]> | string[];
}

const MidwayApiClientInjectionKey: InjectionKey<MidwayApiClientLike> =
  Symbol('MidwayApiClient');

export interface MidwayApiProviderProps {
  client: MidwayApiClientLike;
}

export const MidwayApiProvider = defineComponent({
  name: 'MidwayApiProvider',
  props: {
    client: {
      type: Object,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(MidwayApiClientInjectionKey, props.client as MidwayApiClientLike);
    return () => (slots.default ? slots.default() : null);
  },
});

export function createMidwayApiPlugin(client: MidwayApiClientLike): Plugin {
  return {
    install(app) {
      app.provide(MidwayApiClientInjectionKey, client);
    },
  };
}

export function useMidwayApiClient<TInput = unknown, TOutput = unknown>() {
  const client = inject(MidwayApiClientInjectionKey, null);
  if (!client) {
    throw new Error(
      'useMidwayApiClient must be used inside app.use(createMidwayApiPlugin(client)) or <MidwayApiProvider>'
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
  return (input: TInput) => {
    return client.call(operationId, input);
  };
}
