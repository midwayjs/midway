import { defineApi } from '../../../../src/functional';

defineApi('/entry', api => ({
  ping: api.get('/ping').handle(async () => {
    return 'pong';
  }),
}));
