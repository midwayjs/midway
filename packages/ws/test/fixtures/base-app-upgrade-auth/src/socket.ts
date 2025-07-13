import {
  OnWSConnection,
  OnWSMessage,
  Provide,
  WSController,
} from '@midwayjs/core';

@Provide()
@WSController()
export class HelloSocketController {
  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on connection');
  }

  @OnWSMessage('message')
  async onMessage(data: any) {
    // 处理 Buffer 数据
    let messageData = data;
    if (Buffer.isBuffer(data)) {
      messageData = data.toString();
    }
    
    return { echo: messageData, timestamp: Date.now() };
  }
} 