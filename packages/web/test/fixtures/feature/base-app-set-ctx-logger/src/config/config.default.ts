export const keys = 'key';

export const hello = {
  a: 1,
  b: 2,
  d: [1, 2, 3],
};

export const midwayFeature = {
  replaceEggLogger: true,
}

export const egg = {
}

export const midwayLogger = {
  clients: {
    appLogger: {
      contextFormat: info => {
        const ctx = info.ctx;
        return `${info.timestamp} ${info.LEVEL} ${info.pid} [${Date.now() - ctx.startTime}ms ${ctx.method} abcde] ${info.message}`;
      },
    }
  }
}
