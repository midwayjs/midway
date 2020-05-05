import { parse, saveYaml } from './parse';
import * as fs from 'fs';
import * as path from 'path';
import { SpecBuilder } from './builder';

export * from './interface';
export * from './builder';
export * from './wrapper';

export const transform = (sourcefilePathOrJson: any, builderCls?) => {
  let result: any = sourcefilePathOrJson;
  if (typeof sourcefilePathOrJson === 'string') {
    if (fs.existsSync(sourcefilePathOrJson)) {
      const content = fs.readFileSync(sourcefilePathOrJson, 'utf8');
      // replace
      result = parse(sourcefilePathOrJson, content);
    }
  }
  if (!result) {
    return;
  }
  if (builderCls) {
    return new builderCls(result).toJSON();
  } else {
    return new SpecBuilder(result).toJSON();
  }
};

export { saveYaml } from './parse';

export const generate = (
  sourceFilePathOrJson: any,
  targetFilePath: string,
  builderCls?
) => {
  let baseDir = process.cwd();
  let transformResultJSON = {};
  if (typeof sourceFilePathOrJson === 'string') {
    if (!path.isAbsolute(sourceFilePathOrJson)) {
      sourceFilePathOrJson = path.join(baseDir, sourceFilePathOrJson);
    } else {
      baseDir = path.dirname(sourceFilePathOrJson);
    }
  }
  transformResultJSON = transform(sourceFilePathOrJson, builderCls);
  if (!path.isAbsolute(targetFilePath)) {
    targetFilePath = path.join(baseDir, targetFilePath);
  }
  return saveYaml(targetFilePath, transformResultJSON);
};
