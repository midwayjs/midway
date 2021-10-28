import { Provide, Scope, ScopeEnum, Inject, App } from '@midwayjs/decorator';
import { MidwayInformationService } from '@midwwayjs/core';
import { InfoValueType, TypeInfo } from './interface';
import {  bitToMB, renderToHtml, safeRequire } from './utils';
import { hostname, homedir, cpus, networkInterfaces, uptime, totalmem, } from 'os';
import { join } from 'path';

@Provide()
@Scope(ScopeEnum.Singleton)
export class InfoService {

  @Inject()
  midwayInformationService: MidwayInformationService;

  @App()
  app;

  info(infoValueType?: InfoValueType) {
    const info: TypeInfo[] = [];
    info.push(this.projectInfo());
    info.push(this.systemInfo());
    info.push(this.resourceOccupationInfo());
    info.push(this.softwareInfo());
    info.push(this.timeInfo());
    info.push(this.envInfo());
    info.push(this.dependenciesInfo());
    info.push(this.networkInfo());
    if (infoValueType === InfoValueType.JSON) {
      return info;
    }
    return renderToHtml(info);
  }

  projectInfo(): TypeInfo {
    return {
      type: 'Project',
      info: {
        Project: this.midwayInformationService.getProjectName(),
        AppDir: this.midwayInformationService.getAppDir(),
        BaseDir: this.midwayInformationService.getBaseDir(),
        Root: this.midwayInformationService.getRoot(),
        Env: this.app.getEnv(),
      }
    }
  }

  systemInfo(): TypeInfo {
    const _platform = process.platform;
    return {
      type: 'System',
      info: {
        Platform: (_platform === 'win32' ? 'Windows' : _platform),
        Node: process.versions.node,
        V8: process.versions.v8,
        ProcessId: process.pid,
        Arch: process.arch,
        Hostname: hostname(),
        HomeDir: homedir(),
        CWD: process.cwd(),
        ExecCommand: [].concat(process.argv, process.execArgv).join(' '),
      }
    }
  }
  
  resourceOccupationInfo(): TypeInfo {
    const memory = process.memoryUsage();
    const cpu = cpus();
    return {
      type: 'Memory & CPU',
      info: {
        'Memory Total Occupy': bitToMB(memory.rss),
        'Heap Total Occupy': bitToMB(memory.heapTotal),
        'Heap Used': bitToMB(memory.heapUsed),
        'V8 C++ Object Memory': bitToMB(memory.external),
        'System Total Memory': bitToMB(totalmem()),
        'CPU': `${cpu[0] ? `${cpu[0].model} ${cpu[0].speed}MHz` :''} ${cpu.length} core `,
        'CPU Usage': cpu.map(cpuInfo => {
          const times = cpuInfo.times;
          return ((1-times.idle/(times.idle+times.user+times.nice+times.sys+times.irq))*100).toFixed(2) + '%';
        }).join(' / '),
      }
    }
  }
  
  softwareInfo(): TypeInfo {
    const npmModuleList = [
      '@midwayjs/core',
      '@midwayjs/decorator',
      '@midwayjs/faas',
    ];
    const info = {};
    for(const modName of npmModuleList) {
      const modulePkg = safeRequire(join(modName, 'package.json'));
      if (modulePkg) {
        info[modName] = modulePkg.version;
      }
    }
    return {
      type: 'Software',
      info
    };
  }
  
  envInfo() : TypeInfo{
    return {
      type: 'Environment Variable',
      info: process.env,
    }
  }
  
  timeInfo(): TypeInfo {
    let t = new Date().toString().split(' ');
    return {
      type: 'Time',
      info: {
        Current: Date.now(),
        Uptime: uptime(),
        Timezone: (t.length >= 7) ? t[5] : '',
        TimezoneName: (t.length >= 7) ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '') : ''
      }
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
      info[newType] = netItemList.sort(item => {
        if (item.family === 'IPv4') {
          return -1;
        }
        return 1;
      }).map(netItem => {
        return `${netItem.family} ${netItem.address}`;
      }).join(' / ');
    });
    return {
      type: 'Network',
      info
    };
  }
  
  dependenciesInfo(): TypeInfo {
    const pkg = this.midwayInformationService.getPkg();
    const dependencies = pkg.dependencies || {};
    const info = {};
    Object.keys(dependencies).forEach(modName => {
      const modInfo = safeRequire(join(modName, 'package.json'), {});
      info[modName] = `${modInfo.version || 'Not Found'}(${dependencies[modName]})`;
    });
    return {
      type: 'Dependencies',
      info,
    };
  }
}
