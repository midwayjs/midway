import { HelloService } from '../service/hello';

export const keys = 'apollo-express-key';

export const apollo = {
  path: '/graphql',
  typeDefs: `
    type Query {
      hello: String!
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
        return context.headers['x-apollo-test'];
      },
    },
  },
};
