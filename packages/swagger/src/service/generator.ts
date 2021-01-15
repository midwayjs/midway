import { Provide, Scope, ScopeEnum, CONTROLLER_KEY, listModule, Config } from '@midwayjs/decorator';
import { SwaggerMetaGenerator } from '../lib/generator';
import { SwaggerController } from '../controller/swagger';
import { SwaggerGeneratorInfoOptions } from "../interface";

@Provide('swaggerGenerator')
@Scope(ScopeEnum.Singleton)
export class SwaggerGenerator {

  @Config('swagger')
  swaggerConfig: SwaggerGeneratorInfoOptions;

  generate() {
    const controllerModules = listModule(CONTROLLER_KEY);
    const generator = new SwaggerMetaGenerator(this.swaggerConfig);

    for (const module of controllerModules) {
      if (module !== SwaggerController) {
        generator.generateController(module);
      }
    }
    return generator.generate();
  }
}
