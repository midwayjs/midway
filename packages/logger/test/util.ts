import { existsSync, readFileSync } from 'fs';
import { remove } from 'fs-extra';
import { fork, execSync } from 'child_process';

export const fileExists = (filePath) => {
  return existsSync(filePath);
}

export const removeFileOrDir = async (p) => {
  await remove(p);
  await sleep(500);
}

export const sleep = async (timeout = 1000) => {
  return new Promise<void>(resolve =>  {
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

  if (content === null || content === undefined) {
    return false;
  }

  return content ? content.includes(matchString) : false;
}

export const matchContentTimes = (p: string, matchString: string | RegExp) => {
  let content;
  if(existsSync(p)) {
    content = readFileSync(p, {
      encoding: 'utf8'
    });
  }

  if (content === null || content === undefined) {
    return 0;
  }

  if (typeof matchString === 'string') {
    matchString = new RegExp(matchString);
  }

  const result = content.match(matchString) || [];
  return result.length;
}

export const createChildProcess = (moduleFile) => {
  return fork(moduleFile, ['--require=ts-node/register']);
}

export const getChildProcessPid = (moduleFile) => {
  return execSync('ps aux  | grep node');
}

export const finishLogger = async (logger) => {
  await sleep(5000);
  return new Promise<void>(resolve  => {
    logger.on('finish', () => {
      resolve()
    });
    logger.end();
    logger.close();
  })
}

export const getCurrentDateString = () => {
  // example: 01/23/2021
  const dateString = new Date().toLocaleString('en-us', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const arr = dateString.split('/');
  return `${arr[2]}-${arr[0]}-${arr[1]}`;
};
