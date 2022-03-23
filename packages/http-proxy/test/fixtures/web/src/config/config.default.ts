export const keys = 'test';
export const httpProxy = [
  {
    // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
    match: /\/tfs\//,
    host: 'https://gw.alicdn.com',
  },
  {
    // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
    match: /\/bdimg\/(.*)$/,
    target: 'https://sm.bdimg.com/$1',
  },
  {
    // https://httpbin.org/
    match: /\/httpbin\/(.*)$/,
    target: 'https://httpbin.org/$1',
  }
];