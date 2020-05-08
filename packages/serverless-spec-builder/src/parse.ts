import * as jc from 'json-cycle';
import * as YAML from 'js-yaml';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

const loadYaml = (contents, options) => {
  let data;
  let error;
  try {
    data = YAML.load(contents.toString(), options || {});
  } catch (exception) {
    error = exception;
  }
  return { data, error };
};

export const parse = (filePath, contents) => {
  // Auto-parse JSON
  if (filePath.endsWith('.json')) {
    return jc.parse(contents);
  } else if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
    const options = {
      filename: filePath,
    };
    const result = loadYaml(contents.toString(), options);
    if (result.error) {
      throw result.error;
    }
    return result.data;
  }
  throw new Error('content could not be string');
};

export const saveYaml = (filePath, target) => {
  const text = YAML.safeDump(target, {
    skipInvalid: true,
  });
  try {
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, text);
  } catch (err) {
    throw new Error(`generate ${filePath} error, ${err.message}`);
  }
};
