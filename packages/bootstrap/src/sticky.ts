const cluster = require('cluster');
import { randomBytes } from 'crypto';

const randomId = () => randomBytes(8).toString('hex');

export function setupStickyMaster(httpServer, opts = {}) {
  const options = {
    loadBalancingMethod: 'least-connection', // either "random", "round-robin" or "least-connection"
    ...opts,
  };

  const sessionIdToWorker = new Map();
  const sidRegex = /sid=([\w-]{20})/;
  let currentIndex = 0; // for round-robin load balancing

  const computeWorkerId = data => {
    const match = sidRegex.exec(data);
    if (match) {
      const sid = match[1];
      const workerId = sessionIdToWorker.get(sid);
      if (workerId && cluster.workers[workerId]) {
        return workerId;
      }
    }
    switch (options.loadBalancingMethod) {
      case 'random': {
        const workerIds = Object.keys(cluster.workers);
        return workerIds[Math.floor(Math.random() * workerIds.length)];
      }
      case 'round-robin': {
        const workerIds = Object.keys(cluster.workers);
        currentIndex++;
        if (currentIndex >= workerIds.length) {
          currentIndex = 0;
        }
        return workerIds[currentIndex];
      }
      case 'least-connection':
        // eslint-disable-next-line no-case-declarations
        let leastActiveWorker;
        for (const id in cluster.workers) {
          const worker = cluster.workers[id];
          if (leastActiveWorker === undefined) {
            leastActiveWorker = worker;
          } else {
            const c1 = worker['clientsCount'] || 0;
            const c2 = leastActiveWorker['clientsCount'] || 0;
            if (c1 < c2) {
              leastActiveWorker = worker;
            }
          }
        }
        return leastActiveWorker.id;
    }
  };

  httpServer.on('connection', socket => {
    let workerId, connectionId;

    const sendCallback = err => {
      if (err) {
        socket.destroy();
      }
    };

    socket.on('data', (buffer: Buffer) => {
      let encoding: any = 'utf-8';
      let data = buffer.toString(encoding);
      if (workerId && connectionId) {
        cluster.workers[workerId].send(
          { type: 'sticky:http-chunk', data, encoding, connectionId },
          sendCallback
        );
        return;
      }
      workerId = computeWorkerId(data);
      const mayHaveMultipleChunks = !(
        data.startsWith('GET') ||
        data
          .substring(0, data.indexOf('\r\n\r\n'))
          .includes('pgrade: websocket')
      );
      // avoid binary data toString error
      if (data.startsWith('POST') && data.includes('multipart/form-data')) {
        encoding = 'base64';
        data = buffer.toString('base64');
      }
      socket.pause();
      if (mayHaveMultipleChunks) {
        connectionId = randomId();
      }
      cluster.workers[workerId].send(
        { type: 'sticky:connection', data, encoding, connectionId },
        socket,
        {
          keepOpen: mayHaveMultipleChunks,
        },
        sendCallback
      );
    });
  });

  // this is needed to properly detect the end of the HTTP request body
  httpServer.on('request', req => {
    req.on('data', () => {});
  });

  cluster.on('message', (worker, { type, data }) => {
    switch (type) {
      case 'sticky:connection':
        sessionIdToWorker.set(data, worker.id);
        if (options.loadBalancingMethod === 'least-connection') {
          worker['clientsCount'] = (worker['clientsCount'] || 0) + 1;
        }
        break;
      case 'sticky:disconnection':
        sessionIdToWorker.delete(data);
        if (options.loadBalancingMethod === 'least-connection') {
          worker['clientsCount']--;
        }
        break;
    }
  });
}

export function setupWorker(io: any) {
  // store connections that may receive multiple chunks
  const sockets = new Map();

  process.on(
    'message',
    ({ type, data, encoding, connectionId }, socket: any) => {
      switch (type) {
        case 'sticky:connection':
          if (!socket) {
            // might happen if the socket is closed during the transfer to the worker
            // see https://nodejs.org/api/child_process.html#child_process_example_sending_a_socket_object
            return;
          }
          io.httpServer.emit('connection', socket); // inject connection
          socket.emit('data', Buffer.from(data, encoding)); // republish first chunk
          socket.resume();

          if (connectionId) {
            sockets.set(connectionId, socket);

            socket.on('close', () => {
              sockets.delete(connectionId);
            });
          }

          break;

        case 'sticky:http-chunk': {
          const socket = sockets.get(connectionId);
          if (socket) {
            socket.emit('data', Buffer.from(data, encoding));
          }
        }
      }
    }
  );

  const ignoreError = () => {}; // the next request will fail anyway

  io.engine.on('connection', socket => {
    process.send({ type: 'sticky:connection', data: socket.id }, ignoreError);

    socket.once('close', () => {
      process.send(
        { type: 'sticky:disconnection', data: socket.id },
        ignoreError
      );
    });
  });
}
