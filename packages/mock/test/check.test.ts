import { checkVersion } from '../src/check';
import { join } from 'path';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, unlinkSync, readdirSync, rmdirSync, statSync } from 'fs';

const tempDir = join(__dirname, 'temp');

function emptyDirectorySync(directoryPath) {
  // 读取目录内容
  const files = readdirSync(directoryPath);

  // 遍历目录中的所有文件和子目录
  for (const file of files) {
    // 获取文件的完整路径
    const filePath = join(directoryPath, file);

    // 检查文件类型
    const fileStats = statSync(filePath);

    if (fileStats.isDirectory()) {
      // 如果是目录，则递归调用 emptyDirectorySync
      emptyDirectorySync(filePath);
      // 目录清空后删除目录本身
      rmdirSync(filePath);
    } else {
      // 如果是文件，直接删除
      unlinkSync(filePath);
    }
  }
}

function prepare() {
  // 准备一些测试数据
  // 生成 node_modules 目录，以及 @midwayjs/core 的 package.json

  if (existsSync(tempDir)) {
    emptyDirectorySync(tempDir);
  }

  const nodeModules = join(tempDir, 'node_modules');
  const midwayCore = join(nodeModules, '@midwayjs/core');
  const midwayAxios = join(nodeModules, '@midwayjs/axios');

  mkdirSync(nodeModules, { recursive: true });
  mkdirSync(midwayCore, { recursive: true });
  mkdirSync(midwayAxios, { recursive: true });

  // 拷贝 @midwayjs/core 的 package.json
  const corePkgFile = require.resolve('@midwayjs/core/package.json');
  copyFileSync(corePkgFile, join(midwayCore, 'package.json'));

  // 增加一个假的 @midwayjs/axios 的 package.json
  const axiosPkgFile = join(midwayAxios, 'package.json');
  writeFileSync(axiosPkgFile, JSON.stringify({ name: '@midwayjs/axios', version: '1.0.0' }));
}

describe('check.test.ts', () => {
  it('should check', () => {
    process.env.MWTSC_DEVELOPMENT_ENVIRONMENT = 'true';
    prepare();
    const result = checkVersion(tempDir);
    expect(result.length).toEqual(1);
  });
});
