# Deployment environment

In Serverless scenarios, because the environment is different from the traditional container (provided by the platform and cannot be modified), when we start, we use the traditional command to pass through the environment variables, and the function cannot be read correctly.

For example, the following command can only take effect locally, not on the server.

```bash
$ NODE_ENV midway-bin deploy // Wrong writing, only valid locally
```

We need special ways to make the function container receive the environment as well.

## Publishing environment variable

To distinguish from common environment variables, environment variables deployed to the platform are prefixed with `UDEV_` (User Defined Environment Variable) and **are written to the published yml file corresponding to the environment field.**

For example:

```bash
$ UDEV_NODE_ENV=prod midway-bin deploy
```

At this time, the platform will receive an environment variable named `NODE_ENV` and `prod`.

## YML variable population

You can fill some variables in yml. We provide a default fill keyword `env`, which allows you to assign values to any yml variable. For example:

```yaml
provider:
  runtime: ${env.RUNTIME}
```

Then, if the environment variable added when `midway-bin deploy` is `RUNTIME = nodejs10 midway-bin deploy`, it will be filled:

```yaml
provider:
  runtime: nodejs10
```

## Error stack output

When the function reports an error, Midway will automatically output error information in the function log, including stack, etc. However, the error stack will only be output in the response (Response) in `local` and `development` environments.

If you need to see the error stack in the return values of other environments, you can configure the following environment variables.

```typescript
process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
```

## Copy additional resources

The default build tool only copies the package.json, the built code, and dependencies. If you need to copy other directories, such as some static resources, you need to configure them in `f.yml`.

For example:

```yaml
package: # Package Configuration
  include: # Package contains a list of files, which defaults to package.json, built code, and dependencies.
  	-resource
    -public
  exclude: # Package and Reject File List
  	-test
```
