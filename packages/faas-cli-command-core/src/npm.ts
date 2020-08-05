import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { exec, execSync } from 'child_process';
import * as assert from 'assert';
const homeDir = require('os').homedir();
const commandHookCoreBaseDir = join(homeDir, '.commandHookCore');
const commandHookCoreBasePkg = join(commandHookCoreBaseDir, 'package.json');
const commandHookCoreBaseNodeModules = join(
  commandHookCoreBaseDir,
  'node_modules'
);
if (!existsSync(commandHookCoreBaseDir)) {
  mkdirSync(commandHookCoreBaseDir, '0777');
}
if (!existsSync(commandHookCoreBasePkg)) {
  writeFileSync(commandHookCoreBasePkg, '{}');
}

export const getCoreBaseDir = () => {
  return commandHookCoreBaseNodeModules;
};

async function getNpmPath(
  scope: any,
  npmName: string,
  npmRegistry?: string
): Promise<string> {
  const globalNpmPath = join(commandHookCoreBaseNodeModules, npmName);
  if (existsSync(globalNpmPath)) {
    return globalNpmPath;
  }
  const currentNodeModules = execSync('npm root').toString().replace(/\n$/, '');
  const localNpmPath = join(currentNodeModules, npmName);
  if (existsSync(localNpmPath)) {
    return localNpmPath;
  }

  scope.coreInstance.cli.log(`Installing ${npmName}`);
  await installNpm({
    baseDir: commandHookCoreBaseDir,
    register: npmRegistry,
    npmName,
    mode: 'production',
  });
  return globalNpmPath;
}

interface INpmInstallOptions {
  baseDir?: string;
  register?: string;
  registerPath?: string;
  npmName: string;
  mode?: string;
  slience?: boolean;
}
export async function installNpm(options: INpmInstallOptions) {
  const {
    baseDir,
    register = 'npm',
    npmName,
    mode,
    slience,
    registerPath,
  } = options;
  const cmd = `${baseDir ? `cd ${baseDir};` : ''}${register} i ${npmName}${
    mode ? ` --${mode}` : ' --no-save'
  }${registerPath ? ` --registry=${registerPath}` : ''}`;

  return new Promise((resolved, rejected) => {
    const execProcess = exec(cmd, (err, result) => {
      if (err) {
        return rejected(err);
      }
      resolved(result.replace(/\n$/, '').replace(/^\s*|\s*$/, ''));
    });
    execProcess.stdout.on('data', data => {
      if (!slience) {
        console.log(data);
      }
    });
  });
}

export async function loadNpm(
  scope: any,
  npmName: string,
  npmRegistry?: string
) {
  try {
    const npmPath = await getNpmPath(scope, npmName, npmRegistry);
    assert(npmPath, 'empty npm path');
    let plugin = require(npmPath);
    if (typeof plugin === 'object') {
      plugin = plugin[Object.keys(plugin)[0]];
    }
    scope.addPlugin(plugin);
  } catch (e) {
    scope.error('npmPlugin', { npmName, err: e });
  }
}
