## ADDED Requirements

### Requirement: MikroORM v7 Dedicated Component
The system SHALL provide a dedicated `@midwayjs/mikro7` package for applications using MikroORM v7.

#### Scenario: Installing the v7 component
- **WHEN** a user installs `@midwayjs/mikro7` with MikroORM v7 packages
- **THEN** the package dependency metadata and documentation identify MikroORM v7 as the supported major
- **AND** the user is not instructed to install `@midwayjs/mikro` for the v7 path

#### Scenario: Preserving the v6 component
- **WHEN** a user continues using `@midwayjs/mikro`
- **THEN** the package remains the MikroORM v6 integration path
- **AND** docs show MikroORM v6 dependency ranges for that package

### Requirement: MikroORM v7 Runtime Integration
The `@midwayjs/mikro7` package SHALL initialize MikroORM v7 data sources and integrate request-scoped entity managers with Midway applications.

#### Scenario: Application starts with a v7 data source
- **WHEN** a Midway application imports `@midwayjs/mikro7` and configures a MikroORM v7 data source
- **THEN** the component initializes the data source during application startup
- **AND** the data source is closed during application shutdown

#### Scenario: Request context is active
- **WHEN** a request is handled by a built-in Midway web framework
- **THEN** MikroORM v7 operations use a request-scoped entity manager
- **AND** repository and entity manager injection resolve from that request context when available

### Requirement: v7 Injection API Parity
The `@midwayjs/mikro7` package SHALL expose Midway-facing injection decorators equivalent to the v6 package where MikroORM v7 permits the same behavior.

#### Scenario: Injecting a repository
- **WHEN** a service injects an entity repository through the v7 component decorator
- **THEN** the injected repository is resolved for the configured data source
- **AND** the same decorator supports named data sources when the v6 package supports them

#### Scenario: Injecting an entity manager
- **WHEN** a service injects a MikroORM entity manager through the v7 component decorator
- **THEN** the injected entity manager is resolved for the configured data source
- **AND** request-scoped entity managers are preferred during request handling

### Requirement: Version-Specific Documentation
The documentation SHALL distinguish MikroORM v6 and v7 installation, entity authoring, and configuration requirements.

#### Scenario: Reading v6 docs
- **WHEN** a user follows the MikroORM v6 documentation
- **THEN** the installation examples pin `@mikro-orm/*` packages to the v6 major
- **AND** the examples use imports compatible with MikroORM v6

#### Scenario: Reading v7 docs
- **WHEN** a user follows the MikroORM v7 documentation
- **THEN** the installation examples use `@midwayjs/mikro7` and `@mikro-orm/*` v7 packages
- **AND** entity examples use the v7 decorator package path
- **AND** the docs mention required TypeScript module settings and metadata-provider considerations
