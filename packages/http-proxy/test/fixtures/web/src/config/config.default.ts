export const keys = 'test';
export const httpProxy = {
  strategy: {
    a: {
      // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
      match: /\/tfs\//,
      host: 'https://gw.alicdn.com',
    },
    b: {
      // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
      match: /\/bdimg\/(.*)$/,
      target: 'https://sm.bdimg.com/$1',
    },
    c: {
      // https://httpbin.org/
      match: /\/httpbin\/(.*)$/,
      target: 'https://httpbin.org/$1',
    },
    d: {
      match: /.*?baidu.*$/,
      target: 'https://www.baidu.com/'
    },
    e: {
      match: /\/canredirects\//,
      target: "https://aliyun.com/"
    },
    f: {
      match: /\/noredirects\//,
      target: "https://aliyun.com/",
      //额外的axios请求config, 会照搬过去
      extReqOptions: {
        // `maxRedirects` defines the maximum number of redirects to follow in node.js.
        // If set to 0, no redirects will be followed.
        maxRedirects: 0
      }
    }
  },
};
