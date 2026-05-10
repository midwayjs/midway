## ADDED Requirements

### Requirement: GraphQL Base SDK
The system SHALL provide a runtime-neutral `@midwayjs/graphql` base SDK for shared GraphQL resolver APIs.

#### Scenario: Installing the base SDK through Apollo
- **WHEN** a user installs `@midwayjs/apollo`
- **THEN** `@midwayjs/graphql` is installed as an internal workspace dependency
- **AND** normal Apollo users do not need to import `@midwayjs/graphql` directly

#### Scenario: Runtime-neutral resolver APIs
- **WHEN** a runtime component imports from `@midwayjs/graphql`
- **THEN** it can use shared resolver decorators, metadata, context types, and resolver map assembly utilities
- **AND** the base SDK does not depend on Apollo Server

### Requirement: Apollo GraphQL Component
The system SHALL provide a first-party `@midwayjs/apollo` component for Midway v4 applications.

#### Scenario: Installing the component
- **WHEN** a user installs `@midwayjs/apollo` in a Midway v4 application
- **THEN** the package metadata includes `graphql` and `@apollo/server` as component dependencies
- **AND** the documentation does not require users to install `graphql` or `@apollo/server` separately

#### Scenario: Importing the component
- **WHEN** a user imports the Apollo component in `configuration.ts`
- **THEN** the component registers itself through Midway's standard configuration lifecycle
- **AND** existing applications that do not import the component remain unchanged

#### Scenario: Re-exported resolver APIs
- **WHEN** a user imports `Resolver` or `Query` from `@midwayjs/apollo`
- **THEN** those APIs are available without directly importing `@midwayjs/graphql`

### Requirement: Apollo Configuration Namespace
The component SHALL use the `apollo` configuration namespace.

#### Scenario: User configures Apollo
- **WHEN** the user exports `apollo` config from `config.default.ts`
- **THEN** the component reads endpoint, schema, resolver, context, and Apollo options from that config

#### Scenario: Apollo-specific options
- **WHEN** the user configures Apollo Server specific options
- **THEN** those options live under `apollo.apollo`
- **AND** shared GraphQL fields such as `typeDefs`, `resolvers`, and `contextFactory` remain at the top level

### Requirement: HTTP GraphQL Endpoint
The Apollo component SHALL mount a GraphQL HTTP endpoint into supported Midway web applications.

#### Scenario: Koa application handles a GraphQL query
- **WHEN** a Koa-based Midway application imports the component and configures a schema
- **AND** a client sends a valid GraphQL query to the configured path
- **THEN** the application returns the GraphQL execution result
- **AND** non-GraphQL routes continue to use the existing Midway router behavior

#### Scenario: Express application handles a GraphQL query
- **WHEN** an Express-based Midway application imports the component and configures a schema
- **AND** a client sends a valid GraphQL query to the configured path
- **THEN** the application returns the GraphQL execution result
- **AND** non-GraphQL routes continue to use the existing Midway router behavior

#### Scenario: Endpoint path is customized
- **WHEN** the user configures a custom GraphQL path
- **THEN** the component mounts the endpoint at that path
- **AND** the default `/graphql` path is not mounted unless explicitly configured

#### Scenario: Unsupported HTTP method
- **WHEN** a client sends an unsupported HTTP method to the GraphQL path
- **THEN** the component returns `405 Method Not Allowed`
- **AND** the response includes an `Allow` header listing configured methods

### Requirement: Schema-First GraphQL Configuration
The Apollo component SHALL support schema-first GraphQL configuration through `typeDefs` and `resolvers`.

#### Scenario: Defining inline schema and resolvers
- **WHEN** the user configures GraphQL `typeDefs` and resolver functions
- **THEN** the component passes those definitions to Apollo Server
- **AND** resolver return values are used as the GraphQL response data

#### Scenario: Loading schema files
- **WHEN** the user configures `typePaths` with exact `.graphql` file paths or glob patterns
- **THEN** the component loads matching schema files during startup
- **AND** it combines loaded schema definitions with any inline `typeDefs`

#### Scenario: Invalid schema fails startup
- **WHEN** the configured schema or resolver map is invalid
- **THEN** Midway application startup fails with a useful error
- **AND** the failure is not deferred until the first GraphQL request

### Requirement: DI-Backed Resolver Classes
The component SHALL allow GraphQL resolvers to be implemented as Midway-managed classes.

#### Scenario: Resolver injects a service
- **WHEN** a resolver class is registered with the GraphQL component and injects a Midway service
- **THEN** the resolver method executes through the Midway container
- **AND** injected dependencies are available during GraphQL execution

#### Scenario: Resolver injects GraphQL parameters
- **WHEN** a resolver method uses parameter decorators such as `Args`, `Parent`, `Context`, or `Info`
- **THEN** the component injects the corresponding GraphQL resolver argument into that method parameter
- **AND** passing a field name injects only that field from the source object

#### Scenario: Resolver uses request-scoped dependency
- **WHEN** a resolver depends on request-scoped Midway state
- **THEN** the component resolves the resolver through the active request context when available
- **AND** concurrent GraphQL requests do not share request-scoped dependency instances

### Requirement: GraphQL Subscriptions
The Apollo component SHALL support GraphQL subscriptions over the `graphql-ws` protocol.

#### Scenario: Subscription server is enabled
- **WHEN** the user enables `apollo.subscriptions`
- **THEN** the component registers a WebSocket server on the Midway framework HTTP server after server startup
- **AND** the subscription schema uses the same executable schema and resolver map as HTTP GraphQL

#### Scenario: Subscription resolver executes through DI
- **WHEN** a client subscribes to a field implemented by a decorated resolver class
- **THEN** the subscription resolver executes through a Midway request context
- **AND** resolver methods can return an `AsyncIterable` payload stream

#### Scenario: Subscription server is disabled
- **WHEN** the user leaves `apollo.subscriptions` unset or false
- **THEN** no GraphQL WebSocket server is registered

### Requirement: GraphQL Context Integration
The component SHALL use the active Midway `IMidwayContext` object as Apollo's GraphQL context value.

#### Scenario: Resolver resolves dependency from request container
- **WHEN** a plain resolver map function receives GraphQL context
- **THEN** it can resolve Midway dependencies through `context.requestContext.getAsync(...)`
- **AND** the request container belongs to the active GraphQL request
- **AND** the resolver does not need to unwrap `context.ctx`

#### Scenario: Resolver accesses framework request APIs
- **WHEN** a resolver receives GraphQL context
- **THEN** the context is the Midway-augmented framework request context itself
- **AND** framework-specific request APIs such as headers, cookies, state, and response helpers remain available directly on `context` where the framework provides them

#### Scenario: Resolver reads request metadata
- **WHEN** a resolver receives GraphQL context
- **THEN** it can access Midway fields such as `requestContext`, `logger`, `getLogger`, `setAttr`, `getAttr`, and `getApp`
- **AND** GraphQL-specific metadata, if exposed, is attached under a namespaced field such as `context.graphql`

#### Scenario: User extends context
- **WHEN** the user provides a `contextFactory`
- **THEN** the component calls it for each GraphQL request
- **AND** returned extension fields are attached to the active Midway context for that request only
- **AND** built-in Midway context fields such as `requestContext`, `logger`, and `getApp` remain reserved

### Requirement: Apollo Documentation
The documentation SHALL teach the Apollo GraphQL component from installation through production configuration.

#### Scenario: Beginner follows the docs
- **WHEN** a beginner reads the Apollo GraphQL documentation
- **THEN** the docs first explain what the component solves and when to use it
- **AND** the docs provide the smallest working schema-first Apollo example before advanced options

#### Scenario: User configures Apollo options
- **WHEN** a user reads the Apollo GraphQL documentation
- **THEN** the docs explain that Apollo Server specific options live under `apollo.apollo`
- **AND** resolver decorators are imported from `@midwayjs/apollo`

### Requirement: GraphiQL Landing Page
The Apollo component SHALL provide a development GraphiQL page for browser access.

#### Scenario: Browser requests GraphQL path
- **WHEN** a browser sends a GET request with `Accept: text/html` to the GraphQL path without a query
- **THEN** the component returns a GraphiQL HTML page when `graphiql` is enabled

#### Scenario: Production defaults
- **WHEN** `NODE_ENV` is `production`
- **THEN** GraphiQL is disabled by default unless explicitly enabled
