# Server startup failure troubleshooting

Application startup failure is a very common phenomenon. Logic errors, compilation errors, configuration errors, and environmental problems may all cause your project to fail to start.


## Quickly locate code problems

In most cases, the startup failure we talk about is generally a server environment startup failure. Let's take Linux as an example.

1. Use `ps aux | grep node` to check whether processes exist and whether the number of processes is correct.

2. Open the [project log directory](../logger# Configure log root directory), view the contents of the `common-error.log` file, and check the cause based on the latest stack.

3. Console logs that are started, such as `pm2 logs`


Most of the problems will be found in the log. Please make the habit of logging in to the machine to view the log as much as possible. This is a necessary skill for developers.



## Possible environmental problems

In addition to the problems of the code itself, the environment may also bring some problems. These problems are more difficult to find, and are often related to the system, permissions, environment variables, startup parameters, network environment, and even the kernel itself.

Here are some possible scenarios.

### 1. The document is incomplete or not up to date.

Ensure that your project has performed the following processes before deployment

- 1. Run `npm run dev` or similar command to start locally and run successfully.
- 2. Use `npm run build` to compile the ts file into a js file, and generate the `dist` directory in the root directory.
- 3. Use `npm run start` to run the js file locally.

Check whether the files and directory structure on the server are complete, for example:

- 1. Whether the `node_modules` directory exists
- 2. Whether the `dist` directory and the js file in it exist or is the latest.

### 2. The issue of starting the user's authority

We usually use a regular account, such as an admin account, instead of using sudo to deploy.

- 1. Check whether the user has the permission to start node by creating a directory.
- 2. Check whether the server log directory of the project has write permission

### 3. Startup Port Conflict

If you start multiple Node.js projects, if you use the same port, you will throw a port reuse error.
