import { AddressInfo, createServer } from 'net';

export function sendData(res, data) {
  if (typeof data === 'number') {
    res.status(res.statusCode).send('' + data);
  } else {
    res.status(res.statusCode).send(data);
  }
}

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
