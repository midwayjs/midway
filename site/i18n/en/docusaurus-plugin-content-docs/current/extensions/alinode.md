# Alinode

## Preparation

The application that needs to be accessed is to be deployed in an independent service acquisition cloud environment and can access Internet services.

## create service

**first step**

Log in to Alibaba Cloud and click to activate the service of [Alibaba Cloud's Node.js Performance Platform](https://www.aliyun.com/product/nodejs).

**Second step**

Create a new app, get the App ID and App Secret.
<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617267785895-dd0fb702-91c7-4b25-9c64-8a9358f2d254.png#align=left&display=inline&height=351&margin=%5Bobject% 20Object%5D&name=image.png&originHeight=702&originWidth=1548&size=106487&status=done&style=none&width=774" width="774" />

## Install monitoring dependencies

**first step**

Install the components required by the Node.js Performance Platform

```bash
# Install the version management tool tnvm, please refer to the installation process error: https://github.com/aliyun-node/tnvm
$ wget -O- https://raw.githubusercontent.com/aliyun-node/tnvm/master/install.sh | bash
$ source ~/.bashrc

# tnvm ls-remote alinode # View the required version
$ tnvm install alinode-v6.5.0 # Install the required version
$ tnvm use alinode-v6.5.0 # use the required version

$ npm install @alicloud/agenthub -g # install agenthub
````

There are three parts

- 1. Install tnvm (alinode source)
- 2. Use tnvm to install alinode (replace the default node)
- 3. Install the data collector required by alinode

After the installation is complete, you can check it, you need to make sure that `.tnvm` is included in the path of `which node` and `which agenthub`.

```bash
$ which node
/root/.tnvm/versions/alinode/v3.11.4/bin/node

$ which agenthub
/root/.tnvm/versions/alinode/v3.11.4/bin/agenthub
````

Save the `App ID` and `App Secret` obtained in `Create a new application` as `yourconfig.json` as shown below. For example, in the project root directory.

```typescript
{
  "appid": "****",
  "secret": "****",
}
````

Start the plugin:

```typescript
agenthub start yourconfig.json
````

## start node service

In the installed server, when starting the Node service, you need to add the ENABLE_NODE_LOG=YES environment variable.

for example:

```bash
$ NODE_ENV=production ENABLE_NODE_LOG=YES node bootstrap.js
````

## Docker container approach

For the method of docker container, please refer to [document](https://help.aliyun.com/document_detail/66027.html?spm=a2c4g.11186623.6.580.261ba70feI6mWt).

## other

For more information, please refer to the [documentation](https://help.aliyun.com/document_detail/60338.html?spm=a2c4g.11186623.6.548.599312e6IkGO9v) of the Alibaba Cloud Node.js Performance Platform.