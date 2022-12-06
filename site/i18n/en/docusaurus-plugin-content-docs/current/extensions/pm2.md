# pm2

[PM2](https://github.com/Unitech/pm2) is the production process manager for Node.js applications with built-in load balancers. It can be used to simplify many tedious tasks of Node application management, such as performance monitoring, automatic restart, load balancing, etc.

## Installation

We usually install pm2 to the global.

```bash
$ npm install pm2 -g# command line installation pm2
```

## Common commands

```bash
$ pm2 start# Start a service
$ pm2 list# lists the current services
$ pm2 stop# stop a service
$ pm2 restart# Restart a service
$ pm2 delete# delete a service
$ pm2 logs# view the output log of the service
```

For example, `pm2 list` is displayed in a table.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1616560437389-b193a0d0-b463-49f1-a347-8dec20e7504d.png)

All services of pm2 have an array id, and you can quickly operate it with id.

For example:

```bash
$ pm2 stop 1 # stop service number 1
$ pm2 delete 1 # delete service number 1
```

Use the `-- name` parameter to add an application name.

```bash
$ pm2 start ./bootstrap.js --name test_app
```

Then you can use this application name to operate start and stop.

```bash
$ pm2 stop test_app
$ pm2 restart test_app
```

## Start application

Midway applications generally use `npm run start` for online deployment. The corresponding command is `NODE_ENV = production node bootstrap.js`.

:::info
Compile npm run build is required before deployment
:::

The corresponding pm2 command is

```bash
$ NODE_ENV=production pm2 start ./bootstrap.js --name midway_app -i 4
```

- -- name is used to specify the application name
- -I is used to specify the number of instances (processes) to be started and will be started in cluster mode

The effect is as follows:

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1616562075255-088155ee-7c4f-4eae-b5c5-db826f78b519.png)

## Docker container startup

In the Docker container, the code started in the background will be exited, which will not achieve the expected effect. Pm2 uses another command to support container startup.

Please change the command to pm2-runtime start.

```bash
$ NODE_ENV=production pm2-runtime start ./bootstrap.js --name midway_app -i 4
```

For more information about the pm2 behavior, see [Pm2 container deployment](https://www.npmjs.com/package/pm2#container-support).
