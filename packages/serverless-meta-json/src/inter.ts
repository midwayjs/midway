export interface IOptions {
  yamlData: any; // yml数据
  extra: any; // 额外参数
  archiveType?: string; // 构建包类型
  archivePaths?: string[]; // 构建包地址列表
  archiveDirPath?: string; // 构建包所在目录地址
  generatorArchivePath?: (functionInfo: any) => string; // 生成构建包地址
}

export interface IPathInfo {
  path: string; // 路径
  method: string | string[]; // 方法
}

export interface ITriggerItem {
  http?: IPathInfo;
}

export interface IPathData {
  // 路径详细内容
  'x-gateway-intergration': {
    type: 'function'; // 类型
    url: {
      group: string; // 函数组
      name: string; // 函数名
      version: string; // 函数版本
    };
  };
}

export interface IPathMethodInfo {
  // 区分方法的路径信息
  ALL?: IPathData;
  GET?: IPathData;
  POST?: IPathData;
}

export interface IGateway {
  // 网关信息
  kind: 'simple-mapping'; // 版本
  paths: {
    // 路径信息
    [path: string]: IPathMethodInfo; // 路径详细内容
  };
  'x-gateway-domain'?: string; // 域名
}
