const Consul = require('consul');

// 创建 Consul 客户端实例
const consul = new Consul({
  host: 'localhost',
  port: 8500,
});

async function main() {
  try {
    // 0. 删除所有同名服务实例
    const serviceName = 'test-service';
    try {
      // 获取所有已注册的服务实例
      const services = await consul.agent.service.list();
      for (const id in services) {
        if (services[id].Service === serviceName) {
          await consul.agent.service.deregister(id);
          console.log(`已删除旧的服务实例: ${id}`);
        }
      }
    } catch (err) {
      console.error('清理旧服务实例失败:', err);
    }

    // 1. 连接本地 Consul 服务
    console.log('正在连接 Consul 服务...');
    
    // 2. 注册服务实例
    const serviceId = 'HarrydeMac-Studio.local-54514';
    const failServiceId = 'HarrydeMac-Studio.local-54514-fail';
    
    await consul.agent.service.register({
      id: serviceId,
      name: serviceName,
      address: '127.0.0.1',
      port: 3000,
      tags: ['test'],
      meta: {
        version: '1.0.0'
      },
      check: {
        ttl: '30s'  // TTL 健康检查，30秒超时
      }
    });

    // 注册一个失败的实例
    await consul.agent.service.register({
      id: failServiceId,
      name: serviceName,
      address: '127.0.0.1',
      port: 3001,
      tags: ['test', 'fail'],
      meta: {
        version: '1.0.0',
        status: 'fail'
      },
      check: {
        ttl: '30s'
      }
    });

    // 立即将失败实例标记为 fail
    await consul.agent.check.fail(`service:${failServiceId}`);

    console.log(`服务 ${serviceName} 注册成功`);

    // 3. 间隔上下线
    let online = true;
    const toggleStatus = setInterval(async () => {
      try {
        if (online) {
          await consul.agent.check.pass(`service:${serviceId}`);
          console.log('服务已标记为上线状态');
        } else {
          await consul.agent.check.fail(`service:${serviceId}`);
          console.log('服务已标记为下线状态');
        }
        online = !online;
      } catch (err) {
        console.error('切换服务状态失败:', err);
      }
    }, 10000); // 每10秒切换一次状态

    // 添加 watch 功能测试
    const watcher = consul.watch({
      method: consul.health.service,
      options: {
        service: serviceName,
        passing: true  // 只返回健康状态的实例
      }
    });

    watcher.on('change', (data, res) => {
      console.log('服务状态发生变化:');
      console.log('当前健康实例列表:', data.map(item => ({
        id: item.Service.ID,
        status: item.Checks[0].Status,
        port: item.Service.Port
      })));
    });

    watcher.on('error', (err) => {
      console.error('Watch 错误:', err);
    });

    // 保持 TTL 心跳（每 5 秒一次，防止 TTL 超时）
    // const heartbeat = setInterval(async () => {
    //   try {
    //     await consul.agent.check.pass(`service:${serviceId}`);
    //     console.log('TTL 心跳更新成功');
    //   } catch (err) {
    //     console.error('TTL 心跳更新失败:', err);
    //   }
    // }, 5000);

    // 优雅退出
    process.on('SIGINT', async () => {
      // clearInterval(heartbeat);
      clearInterval(toggleStatus);
      watcher.end(); // 清理 watcher
      await consul.agent.service.deregister(serviceId);
      await consul.agent.service.deregister(failServiceId); // 注销失败实例
      console.log('服务已注销');
      process.exit(0);
    });

  } catch (err) {
    console.error('发生错误:', err);
    process.exit(1);
  }
}

main();
