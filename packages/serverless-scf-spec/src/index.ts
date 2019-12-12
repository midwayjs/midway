import { generate, transform } from '@midwayjs/spec-builder';
import { SCFTemplateSpecBuilder } from './builder/template';
import { SCFServerlessSpecBuilder } from './builder/serverless';

export const generateFunctionsSpec = (filePath: string) => {
  return transform(filePath, SCFServerlessSpecBuilder);
};

export const generateTemplateFunctionsSpec = (filePath: string) => {
  return transform(filePath, SCFTemplateSpecBuilder);
};

export const generateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = '.serverless/serverless.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, SCFServerlessSpecBuilder);
};

export const generateTemplateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = 'template.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, SCFTemplateSpecBuilder);
};
