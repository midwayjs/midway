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
  filePath: string,
  targetFilePath = '.serverless/serverless.yml'
) => {
  generate(filePath, targetFilePath, SCFServerlessSpecBuilder);
};

export const generateTemplateFunctionsSpecFile = (
  filePath: string,
  targetFilePath = 'template.yml'
) => {
  generate(filePath, targetFilePath, SCFTemplateSpecBuilder);
};
