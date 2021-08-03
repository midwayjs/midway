import { EggPlugin } from 'egg';

// 启用socketio
const io = {
  enable: true,
  package: 'egg-socket.io',
};

export default {
  static: false, // default is true
  io,
} as EggPlugin;
