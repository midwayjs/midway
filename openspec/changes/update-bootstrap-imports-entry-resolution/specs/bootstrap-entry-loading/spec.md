## ADDED Requirements

### Requirement: Bootstrap project entry resolution

The Bootstrap initialization process SHALL automatically resolve and load the conventional project entry only when `IMidwayBootstrapOptions.imports` is `undefined`.

#### Scenario: Imports are omitted

- **WHEN** an application starts without providing the `imports` option
- **THEN** Bootstrap resolves and loads the conventional project entry from `baseDir`

#### Scenario: Imports are explicitly provided as an array

- **WHEN** an application starts with an explicit array in the `imports` option
- **THEN** Bootstrap loads only the modules in that array
- **AND** Bootstrap does not append the conventional project entry

#### Scenario: A single import module is explicitly provided

- **WHEN** an application starts with a single module in the `imports` option
- **THEN** Bootstrap normalizes and loads that module
- **AND** Bootstrap does not append the conventional project entry

#### Scenario: Imports are explicitly empty

- **WHEN** an application starts with `imports` set to an empty array
- **THEN** Bootstrap does not load the conventional project entry
- **AND** Bootstrap does not load any project import module

### Requirement: Consistent entry resolution across initialization modes

The synchronous and asynchronous application context initialization paths SHALL apply the same project entry resolution semantics.

#### Scenario: Equivalent options use equivalent imports

- **WHEN** synchronous and asynchronous initialization receive equivalent Bootstrap options
- **THEN** both paths select the same set of project import modules
