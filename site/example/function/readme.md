## Getting Started

Docs：[Midway Hooks - Getting Started](https://www.yuque.com/midwayjs/midway_v2/hooks_intro?translate=en)

### Directory Structure

```
.
├── bootstrap.js //
├── jest.config.js // Unit test file
├── midway.config.ts // config file for setup directory and middleware
├── src
│   ├── apis // Backend directory
│   │   ├── configuration.ts // Midway Hooks configuration
│   │   └── lambda // Api directory(Can be modified in midway.config.ts)
│   │       ├── index.test.ts // Api test file
│   │       └── index.ts // Api file
│   └── main.ts // Frontend framework file
├── tsconfig.json
└── vite.config.ts
```

### Commands

#### Start Dev Server

```bash
$ npm run dev
```

#### Build

```bash
$ npm run build
```

### Running in production mode

```bash
$ node bootstrap.js
```
