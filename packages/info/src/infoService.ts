import {
  Provide,
  Scope,
  ScopeEnum,
  Inject,
  ApplicationContext,
  Config,
  Init,
} from '@midwayjs/core';
import {
  MidwayInformationService,
  IMidwayContainer,
  MidwayConfigService,
  MidwayEnvironmentService,
} from '@midwayjs/core';
import { InfoType, InfoValueType, TypeInfo } from './interface';
import { bitToMB, renderToHtml, safeContent, safeRequire } from './utils';
import {
  hostname,
  homedir,
  cpus,
  networkInterfaces,
  uptime,
  totalmem,
} from 'os';
import { join } from 'path';
import * as pm from 'picomatch';

@Provide()
@Scope(ScopeEnum.Singleton)
export class InfoService {
  @Inject()
  midwayInformationService: MidwayInformationService;

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  environment: MidwayEnvironmentService;

  @Config('info.title')
  titleConfig: string;

  @Config('info.hiddenKey')
  defaultHiddenKey: string[];

  @Config('info.ignoreKey')
  ignoreKey: string[];

  secretMatchList: Array<any>;

  @ApplicationContext()
  container: IMidwayContainer;

  @Init()
  async init() {
    this.secretMatchList = Array.from(new Set(this.defaultHiddenKey)).map(
      pattern => {
        return pm(pattern);
      }
    );
  }

  info(infoValueType?: InfoValueType) {
    const allInfo: TypeInfo[] = [];
    allInfo.push(this.projectInfo());
    allInfo.push(this.systemInfo());
    allInfo.push(this.resourceOccupationInfo());
    allInfo.push(this.softwareInfo());
    allInfo.push(this.midwayConfig());
    allInfo.push(this.midwayService());
    allInfo.push(this.timeInfo());
    allInfo.push(this.envInfo());
    allInfo.push(this.dependenciesInfo());
    allInfo.push(this.networkInfo());

    // 过滤自定义隐藏的key
    const newInfo = allInfo.map(({ type, info }) => {
      const infoKeys = Object.keys(info);
      const keys = infoKeys.filter(k => !this.ignoreKey.includes(k));
      const infoByIgnore = {};
      for (const key of keys) {
        infoByIgnore[key] = info[key];
      }
      return { type, info: infoByIgnore };
    });

    if (infoValueType === 'html') {
      return renderToHtml(newInfo, this.titleConfig);
    }
    return newInfo;
  }

  projectInfo(): TypeInfo {
    return {
      type: InfoType.PROJECT,
      info: {
        Project: this.midwayInformationService.getProjectName(),
        AppDir: this.midwayInformationService.getAppDir(),
        BaseDir: this.midwayInformationService.getBaseDir(),
        Root: this.midwayInformationService.getRoot(),
        Env: this.environment.getCurrentEnvironment(),
      },
    };
  }

  systemInfo(): TypeInfo {
    const _platform = process.platform;
    return {
      type: InfoType.SYSTEM,
      info: {
        Platform: _platform === 'win32' ? 'Windows' : _platform,
        Node: process.versions.node,
        V8: process.versions.v8,
        ProcessId: process.pid,
        Arch: process.arch,
        Hostname: hostname(),
        HomeDir: homedir(),
        CWD: process.cwd(),
        ExecCommand: [].concat(process.argv, process.execArgv).join(' '),
      },
    };
  }

  resourceOccupationInfo(): TypeInfo {
    const memory = process.memoryUsage();
    const cpu = cpus();
    return {
      type: InfoType.MEMORY_CPU,
      info: {
        'Memory Total Occupy': bitToMB(memory.rss),
        'Heap Total Occupy': bitToMB(memory.heapTotal),
        'Heap Used': bitToMB(memory.heapUsed),
        'V8 C++ Object Memory': bitToMB(memory.external),
        'System Total Memory': bitToMB(totalmem()),
        CPU: `${cpu[0] ? `${cpu[0].model} ${cpu[0].speed}MHz` : ''} ${
          cpu.length
        } core `,
        'CPU Usage': cpu
          .map(cpuInfo => {
            const times = cpuInfo.times;
            return (
              (
                (1 -
                  times.idle /
                    (times.idle +
                      times.user +
                      times.nice +
                      times.sys +
                      times.irq)) *
                100
              ).toFixed(2) + '%'
            );
          })
          .join(' / '),
      },
    };
  }

  softwareInfo(): TypeInfo {
    const npmModuleList = [
      '@midwayjs/core',
      '@midwayjs/decorator',
      '@midwayjs/faas',
    ];
    const info = {};
    for (const modName of npmModuleList) {
      const modulePkg = this.midwayInformationService.getPkg();
      if (modulePkg) {
        info[modName] = modulePkg.version;
      }
    }
    return {
      type: InfoType.SOFTWARE,
      info,
    };
  }

  envInfo(): TypeInfo {
    const env = {};
    Object.keys(process.env).forEach(envName => {
      env[envName] = this.filterSecretContent(envName, process.env[envName]);
    });
    return {
      type: InfoType.ENVIRONMENT_VARIABLE,
      info: env,
    };
  }

  timeInfo(): TypeInfo {
    const t = new Date().toString().split(' ');
    return {
      type: InfoType.TIME,
      info: {
        Current: Date.now(),
        Uptime: uptime(),
        Timezone: t.length >= 7 ? t[5] : '',
        TimezoneName:
          t.length >= 7
            ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '')
            : '',
      },
    };
  }

  networkInfo(): TypeInfo {
    const net = networkInterfaces();
    const info = {};
    Object.keys(net).forEach(type => {
      const netItemList = net[type];
      let newType = type;
      if (type[type.length - 1] === '0') {
        newType = type.slice(0, -1);
      }
      // ignore localhost
      if (newType === 'lo') {
        return;
      }
      info[newType] = netItemList
        .sort(item => {
          if (item.family === 'IPv4') {
            return -1;
          }
          return 1;
        })
        .map(netItem => {
          return `${netItem.family} ${netItem.address}`;
        })
        .join(' / ');
    });
    return {
      type: InfoType.NETWORK,
      info,
    };
  }

  dependenciesInfo(): TypeInfo {
    const pkg = this.midwayInformationService.getPkg();
    const dependencies = pkg.dependencies || {};
    const info = {};
    Object.keys(dependencies).forEach(modName => {
      const modInfo = safeRequire(join(modName, 'package.json'), {});
      info[modName] = `${modInfo.version || 'Not Found'}(${
        dependencies[modName]
      })`;
    });
    return {
      type: InfoType.DEPENDENCIES,
      info,
    };
  }

  midwayService() {
    const info = {};
    if (this.container?.registry) {
      for (const item of (this.container as any).registry) {
        const [key, value] = item;
        const name = value ? value?.name || value : typeof value;
        info[key] = `${value?.namespace ? `${value?.namespace}:` : ''}${name}${
          value?.scope ? ` [${value?.scope}]` : ''
        }`;
      }
    }

    return {
      type: InfoType.MIDWAY_SERVICE,
      info,
    };
  }

  midwayConfig() {
    const info = {};
    const config = this.configService.getConfiguration() || {};
    Object.keys(config).forEach(key => {
      info[key] = this.safeJson(this.filterSecretContent(key, config[key]));
    });
    return {
      type: InfoType.MIDWAY_CONFIG,
      info,
    };
  }

  protected filterSecretContent(key: string, value: any) {
    if (typeof value === 'string') {
      const find = this.secretMatchList.some(isMatch => {
        return isMatch(key.toLowerCase());
      });
      if (find) {
        return safeContent(value);
      }
    } else if (Array.isArray(value)) {
      return value.map(item => {
        return this.filterSecretContent(key, item);
      });
    }

    return value;
  }

  protected safeJson(value: any): string {
    switch (typeof value) {
      case 'string':
        return `"${value}"`;
      case 'number':
        return `${value}`;
      case 'boolean':
        return String(value);
      case 'object':
        if (!value) {
          return 'null';
        }
        if (Array.isArray(value)) {
          return `[${value.map(item => this.safeJson(item)).join(',')}]`;
        }
        if (value instanceof RegExp) {
          return `"${value.toString()}"`;
        }
        // eslint-disable-next-line no-case-declarations
        const props = [];
        for (const key in value) {
          props.push(
            `"${key}":${this.safeJson(
              this.filterSecretContent(key, value[key])
            )}`
          );
        }
        return `{${props.join(',')}}`;
      case 'function':
        return `function ${value.name}(${value.length} args)`;
    }
    return '';
  }
}
