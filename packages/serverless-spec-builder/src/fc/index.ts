import { transform, generate } from '../index';
import { FCSpecBuilder } from './builder';

export const generateFunctionsSpec = filePath => {
  return transform(filePath, FCSpecBuilder);
};

export const generateFunctionsSpecFile = (
  filePath,
  targetFilePath = 'template.yml'
) => {
  generate(filePath, targetFilePath, FCSpecBuilder);
};
