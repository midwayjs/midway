import { parse, saveYaml } from './parse';
import * as fs from 'fs';
import * as path from 'path';
import { SpecBuilder } from './builder';

export * from './interface';
export * from './builder';

export const transform = (sourcefilePath: string, builderCls?) => {
  if (fs.existsSync(sourcefilePath)) {
    const content = fs.readFileSync(sourcefilePath, 'utf8');
    const result = parse(sourcefilePath, content);
    if (builderCls) {
      return new builderCls(result).toJSON();
    } else {
      return new SpecBuilder(result).toJSON();
    }
  }
};

export { saveYaml } from './parse';

export const generate = (sourceFilePath: string, targetFilePath: string, builderCls?) => {
  const transformResultJSON = transform(sourceFilePath, builderCls);
  let baseDir = process.cwd();
  if (!path.isAbsolute(sourceFilePath)) {
    sourceFilePath = path.join(baseDir, sourceFilePath);
  } else {
    baseDir = path.dirname(sourceFilePath);
  }
  if (!path.isAbsolute(targetFilePath)) {
    targetFilePath = path.join(baseDir, targetFilePath);
  }
  return saveYaml(targetFilePath, transformResultJSON);
};
