---
type: lesson
title: Best Practices Summary
focus: /src/configuration.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Midway.js Best Practices

This section summarizes practical patterns for maintainable Midway projects.

## Recommended structure

```text
src/
├── controller/
├── service/
├── middleware/
├── filter/
├── dto/
├── entity/
├── error/
├── util/
├── config/
├── interface.ts
├── configuration.ts
└── bootstrap.ts
```

## Design principles

### Single responsibility

- Controller: HTTP orchestration
- Service: business logic
- Repository/data layer: persistence logic

### Depend on abstractions

Use interfaces where possible for better decoupling and testability.

### Async-first coding

Prefer `async/await` for readable I/O flow.

## API design guidelines

- Follow RESTful route conventions
- Keep response schema consistent
- Return meaningful status codes and error messages

## Testing guidance

Use `@midwayjs/mock` + Jest for integration and endpoint tests.

## Final checklist

- Clear layering
- Unified error handling
- Strict validation
- Environment-based configuration
- Test coverage for core business flows
