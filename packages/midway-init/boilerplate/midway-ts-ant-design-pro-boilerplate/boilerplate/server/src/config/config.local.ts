import * as path from 'path';

module.exports = (appInfo: any) => {
  const config: any = (exports = {});

  config.assets = {
    publicPath: 'public',
    devServer: {
      autoPort: true,
      command: 'cross-env umi dev --port={port}',
      env: {
        APP_ROOT: path.join(__dirname, '../../../client'),
        portPath: path.join(appInfo.baseDir, '../run/assetsPort'),
        BROWSER: 'none',
        SOCKET_SERVER: 'http://127.0.0.1:{port}'
      },
      debug: true
    }
  };

  return config;
};
