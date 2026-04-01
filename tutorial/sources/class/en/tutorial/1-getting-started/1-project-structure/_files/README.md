# Midway.js Project

A standard Midway.js project structure.

## Project Structure

```
.
├── src/                          # Source directory
│   ├── controller/               # Controller directory
│   │   └── home.controller.ts    # Home controller
│   ├── service/                  # Service directory
│   ├── config/                   # Config directory
│   │   └── config.default.ts     # Default config
│   └── configuration.ts          # App configuration
├── bootstrap.js                  # Bootstrap file
├── package.json                  # Project config
└── tsconfig.json                 # TypeScript config
```

## Directory Notes

- **controller/** - Controller layer for HTTP handlers
- **service/** - Service layer for business logic
- **config/** - Configuration files
- **configuration.ts** - App configuration entry
- **bootstrap.js** - App bootstrap file
