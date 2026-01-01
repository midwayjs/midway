import { AddressInfo, createServer } from 'net';

export async function getFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      try {
        const port = (server.address() as AddressInfo).port;
        server.close();
        resolve(port);
      } catch (err) {
        reject(err);
      }
    });
  });
}
