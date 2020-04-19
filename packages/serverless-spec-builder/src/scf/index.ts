import { SCFServerlessSpecBuilder } from './builder';
import { transform, generate } from '..';

export const generateFunctionsSpec = (filePath: any) => {
  return transform(filePath, SCFServerlessSpecBuilder);
};

export const generateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = '.serverless/serverless.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, SCFServerlessSpecBuilder);
};
