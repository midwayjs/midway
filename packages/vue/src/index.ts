import type { ApiClient } from '@midwayjs/web-bridge';
import { createClient } from '@midwayjs/web-bridge';
import {
  defineComponent,
  inject,
  provide,
  type InjectionKey,
  type Plugin,
} from 'vue';

export { createClient };

const MidwayApiClientInjectionKey: InjectionKey<ApiClient<any, any>> =
  Symbol('MidwayApiClient');

export interface MidwayApiProviderProps {
  client: ApiClient<any, any>;
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
    provide(MidwayApiClientInjectionKey, props.client as ApiClient<any, any>);
    return () => (slots.default ? slots.default() : null);
  },
});

export function createMidwayApiPlugin(client: ApiClient<any, any>): Plugin {
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
  return client as ApiClient<TInput, TOutput>;
}

export function useMidwayApiOperation<TInput = unknown, TOutput = unknown>(
  operationId: string
) {
  const client = useMidwayApiClient<TInput, TOutput>();
  return (input: TInput) => {
    return client.call(operationId, input);
  };
}
