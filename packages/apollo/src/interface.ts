import { GraphQLBaseConfigurationOptions } from '@midwayjs/graphql';

/**
 * GraphiQL landing page options.
 */
export interface ApolloGraphiQLOptions {
  title?: string;
  endpoint?: string;
}

/**
 * GraphQL over WebSocket subscription options.
 */
export interface ApolloSubscriptionOptions {
  path?: string;
  connectionInitWaitTimeout?: number;
}

/**
 * Apollo component configuration.
 */
export interface ApolloConfigurationOptions extends GraphQLBaseConfigurationOptions {
  apollo?: Record<string, any>;
  graphiql?: boolean | ApolloGraphiQLOptions;
  subscriptions?: boolean | ApolloSubscriptionOptions;
}
