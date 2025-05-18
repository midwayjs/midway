const { Etcd3 } = require('etcd3');

const client = new Etcd3({ hosts: '127.0.0.1:2379' });

const serviceName = 'test-service';
const instanceId = `node-${Math.floor(Math.random() * 10000)}`;
const instanceKey = `services/${serviceName}/${instanceId}`;
const instanceValue = JSON.stringify({
  id: instanceId,
  serviceName,
  host: '127.0.0.1',
  port: 3000,
  meta: { version: '1.0.0' }
});
const ttl = 30; // 秒

let lease;
let watcher;

async function register() {
  lease = client.lease(ttl);
  await lease.put(instanceKey).value(instanceValue);
  console.log(`注册服务实例: ${instanceKey}`);
}

async function deregister() {
  if (lease) {
    await lease.revoke();
    lease = null;
    console.log(`注销服务实例: ${instanceKey}`);
  } else {
    await client.delete().key(instanceKey);
    console.log(`直接删除服务实例: ${instanceKey}`);
  }
}

async function startWatch() {
  watcher = await client.watch()
    .prefix(`services/${serviceName}/`)
    .create();

  watcher
    .on('put', async res => {
      const all = await client.getAll().prefix(`services/${serviceName}/`).strings();
      console.log('服务实例变更，当前实例列表：');
      Object.entries(all).forEach(([key, val]) => {
        try {
          const inst = JSON.parse(val);
          console.log(`- ${inst.id} (${inst.host}:${inst.port})`);
        } catch {}
      });
    })
    .on('delete', async res => {
      const all = await client.getAll().prefix(`services/${serviceName}/`).strings();
      console.log('服务实例变更，当前实例列表：');
      Object.entries(all).forEach(([key, val]) => {
        try {
          const inst = JSON.parse(val);
          console.log(`- ${inst.id} (${inst.host}:${inst.port})`);
        } catch {}
      });
    });
  console.log('已开启服务变更监听');
}

async function main() {
  await register();
  await startWatch();

  // 模拟心跳续约
  const heartbeat = setInterval(async () => {
    if (lease) {
      try {
        await lease.keepaliveOnce();
        // console.log('心跳续约成功');
      } catch (err) {
        console.error('心跳续约失败:', err);
      }
    }
  }, (ttl - 5) * 1000);

  // 优雅退出
  process.on('SIGINT', async () => {
    clearInterval(heartbeat);
    if (watcher) await watcher.cancel();
    await deregister();
    await client.close();
    console.log('服务已注销并关闭 etcd 连接');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('发生错误:', err);
  process.exit(1);
});
