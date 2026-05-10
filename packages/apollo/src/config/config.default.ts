export const apollo = {
  path: '/graphql',
  methods: ['GET', 'POST'],
  graphiql: process.env.NODE_ENV !== 'production',
  subscriptions: false,
  resolvers: {},
};
