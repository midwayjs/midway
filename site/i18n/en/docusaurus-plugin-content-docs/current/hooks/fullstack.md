# Full stack kit

In Midway Hooks, we provide `@midwayjs/hooks-kit` to quickly develop full stack applications. At present, we provide the following templates that can be used directly:

- [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
- [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
- [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)

## Command line interface

In projects that use `@midwayjs/hooks-kit`, hooks executables can be used in npm scripts or run through `npx hooks`. The following is the default npm scripts in Midway full stack projects created through scaffolding:

```json
{
  "scripts": {
    "dev": "hooks dev", // start the development server
    "start": "hooks start", // start the production server, please make sure you have run' npm run build' before using it'
    "build": "hooks build" // Build the product for production
  }
}
```

When using a command line, you can pass in options through command line parameters, and specific options can be referenced through -- help.

For example, `hooks build -- help`

Output:

```
Usage:
  $hooks build [root]

Options:
  --outDir <dir> [string] output directory (default: dist)
  --clean [boolean] clean output directory before build (default: false)
  -h, --help Display this message
```
