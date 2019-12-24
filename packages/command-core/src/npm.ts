import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import * as assert from 'assert';
const homeDir = require('os').homedir();
const currentNodeModules = execSync('npm root').toString();
const commandHookCoreBaseDir = join(homeDir, '.commandHookCore');
const commandHookCoreBasePkg = join(commandHookCoreBaseDir, 'package.json');
const commandHookCoreBaseNodeModules = join(commandHookCoreBaseDir, 'node_modules');
if (!existsSync(commandHookCoreBaseDir)) {
    mkdirSync(commandHookCoreBaseDir, '0777');
}
if (!existsSync(commandHookCoreBasePkg)) {
    writeFileSync(commandHookCoreBasePkg, `{}`);
}

async function getNpmPath(scope: any, npmName: string, npmRegistry?: string): Promise<string> {
    const globalNpmPath = join(commandHookCoreBaseNodeModules, npmName);
    if (existsSync(globalNpmPath)) {
        return globalNpmPath;
    }

    const localNpmPath = join(currentNodeModules, npmName);
    if (existsSync(localNpmPath)) {
        return localNpmPath;
    }

    scope.coreInstance.cli.log(`Installing ${npmName}`);
    execSync(`cd ${commandHookCoreBaseDir};${npmRegistry || 'npm'} i ${npmName} --production`);

    return globalNpmPath;
}

export async function loadNpm(scope: any, npmName: string, npmRegistry?: string) {
    try {
        const npmPath = await getNpmPath(scope, npmName, npmRegistry);
        assert(npmPath, 'empty npm path');
        const plugin = require(npmPath);
        scope.addPlugin(plugin);
    } catch (e) {
        scope.error('npmPlugin', { npmName, err: e});
    }
}
