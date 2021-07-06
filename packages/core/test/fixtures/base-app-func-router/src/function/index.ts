import { Provide, Func } from '@midwayjs/decorator';

@Provide()
@Func('index.handler', { middleware: ['bottleServiceMiddleware'] })
export class IndexHandler {
  /**
   * @param event
   */
  async handler(event) {
    return {
      data: 'hello world'
    };
  }
}


@Provide()
export class IndexOneHandler {
  /**
   * @param event
   */
  @Func('indexone.handler', { middleware: ['bottleServiceMiddleware'] })
  async handlerone(event) {
    return {
      data: 'hello world one'
    };
  }

  /**
   * @param event
   */
   @Func('indextwo.handler')
   async handlertwo(event) {
     return {
       data: 'hello world two'
     };
   }
}