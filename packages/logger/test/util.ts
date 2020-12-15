import { existsSync, readFileSync } from 'fs';
import { remove } from 'fs-extra';
import { fork, execSync } from 'child_process';

export const fileExists = (filePath) => {
  return existsSync(filePath);
}

export const removeFileOrDir = async (p) => {
  await remove(p);
}

export const sleep = async (timeout = 1000) => {
  return new Promise(resolve =>  {
    setTimeout(resolve, timeout);
  });
}

export const includeContent = (p: string, matchString: string) => {
  let content;
  if(existsSync(p)) {
    content = readFileSync(p, {
      encoding: 'utf8'
    });
  }

  return content ? content.includes(matchString) : false;
}

export const createChildProcess = (moduleFile) => {
  return fork(moduleFile, ['--require=ts-node/register']);
}

export const getChildProcessPid = (moduleFile) => {
  return execSync('ps aux  | grep node');
}
