export interface SwaggerGeneratorInfoOptions {
  title: string;
  description: string;
  version: string;
  termsOfService: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
  license: {
    name: string;
    url: string;
  }
}
