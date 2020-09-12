///<reference types="node" />

import { IMidwayContainer } from '@midwayjs/core';
import 'socket.io';

declare namespace SocketIO {
  export interface Socket extends nodejs.eventemitter {
    requestContext: IMidwayContainer;
  }
}

export = SocketIO;
