import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { satisfies } from 'compare-versions';

/**
 * 获取实际安装的版本
 * @param {*} pkgName
 * @param {*} resolveMode
 * @param {*} options
 * @returns
 */
function getVersion(pkgName: string, cwd: string, resolveMode = true) {
  try {
    if (resolveMode) {
      return require(join(cwd, 'node_modules', `${pkgName}/package.json`))
        .version;
    } else {
      return require(`${pkgName}/package.json`).version;
    }
  } catch (e) {
    return undefined;
  }
}

export function checkVersion(cwd = process.cwd()) {
  if (process.env.MWTSC_DEVELOPMENT_ENVIRONMENT !== 'true') {
    return;
  }

  const coreVersion = getVersion('@midwayjs/core', cwd);

  // 开始检查包版本
  const baseDir = dirname(require.resolve('@midwayjs/version'));
  // 新版本 core 和 decorator 的版本应该是一样的
  const decoratorVersion =
    getVersion('@midwayjs/decorator', cwd) || coreVersion;
  const result = [];
  const versionFile = join(
    baseDir,
    `versions/${decoratorVersion.replace(/\./g, '_')}-${coreVersion.replace(
      /\./g,
      '_'
    )}.json`
  );

  if (!existsSync(versionFile)) {
    return;
  }

  const text = readFileSync(versionFile, 'utf-8');
  const versions = Object.assign({}, JSON.parse(text));

  // 当前版本的包信息列表
  const pkgList = Object.keys(versions);

  for (const pkgName of pkgList) {
    const version = getVersion(pkgName, cwd);
    if (!version) {
      continue;
    }

    // 格式化 version 的版本列表，变为数组形式，从小到大排列
    versions[pkgName] = [].concat(versions[pkgName]);

    if (versions[pkgName].indexOf(version) !== -1) {
      // ok
    } else {
      // 支持 semver 对比
      if (versions[pkgName].some(v => satisfies(version, v))) {
      } else {
        // fail
        result.push({
          name: pkgName,
          current: version,
          allow: versions[pkgName],
        });
      }
    }
  }

  return result;
}
