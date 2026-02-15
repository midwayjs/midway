import { defineApi } from '../../../../src/functional';

defineApi('/detector', api => ({
  ping: api.get('/ping').handle(async () => {
    return 'pong';
  }),
}));
