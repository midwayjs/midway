import { HelloService } from '../service/hello';

export const keys = 'apollo-koa-key';

export const apollo = {
  path: '/graphql',
  subscriptions: true,
  typePaths: ['./schema.graphql', './graphql/**/*.graphql'],
  typeDefs: `
    type Query {
      hello: String!
      decoratedHello: String!
      header: String
    }
  `,
  resolvers: {
    Query: {
      hello: async (_parent, _args, context) => {
        const service = await context.requestContext.getAsync(HelloService);
        return service.say();
      },
      header: (_parent, _args, context) => {
        return context.get('x-apollo-test');
      },
      schemaLoaded: () => 'schema file',
    },
  },
};
