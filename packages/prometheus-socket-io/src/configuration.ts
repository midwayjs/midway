import { App, Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { DataService } from '@midwayjs/prometheus';
import * as prometheus from '@midwayjs/prometheus';

@Configuration({
  imports: [prometheus],
  namespace: 'prometheus-socket-io',
})
export class AutoConfiguration {
  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;

  async onReady(contanier) {
    const dataService: DataService = await this.socketApp
      .getApplicationContext()
      .getAsync(DataService);

    const dataToBytes = (data: any) => {
      try {
        return Buffer.byteLength(
          typeof data === 'string' ? data : JSON.stringify(data) || '',
          'utf8'
        );
      } catch (e) {
        return 0;
      }
    };
    dataService.define('connectedSockets', 'Gauge', {
      name: 'socket_io_connected',
      help: 'Number of currently connected sockets',
    });

    dataService.define('connectTotal', 'Counter', {
      name: 'socket_io_connect_total',
      help: 'Total count of socket.io connection requests',
      labelNames: ['namespace'],
    });

    dataService.define('disconnectTotal', 'Counter', {
      name: 'socket_io_disconnect_total',
      help: 'Total count of socket.io disconnections',
      labelNames: ['namespace'],
    });

    dataService.define('bytesTransmitted', 'Counter', {
      name: 'socket_io_transmit_bytes',
      help: 'Total socket.io bytes transmitted',
      labelNames: ['event', 'namespace'],
    });

    dataService.define('eventsSentTotal', 'Counter', {
      name: 'socket_io_events_sent_total',
      help: 'Total count of socket.io sent events',
      labelNames: ['event', 'namespace'],
    });

    dataService.define('errorsTotal', 'Counter', {
      name: 'socket_io_errors_total',
      help: 'Total socket.io errors',
      labelNames: ['namespace'],
    });

    dataService.define('bytesReceived', 'Counter', {
      name: 'socket_io_receive_bytes',
      help: 'Total socket.io bytes received',
      labelNames: ['event', 'namespace'],
    });

    dataService.define('eventsReceivedTotal', 'Counter', {
      name: 'socket_io_events_received_total',
      help: 'Total count of socket.io received events',
      labelNames: ['event', 'namespace'],
    });

    const labels = { namespace: '/' };

    const blacklisted_events = new Set([
      'error',
      'connect',
      'disconnect',
      'disconnecting',
      'newListener',
      'removeListener',
    ]);

    const disconnect = socket => {
      if ((socket as any).midwayConnect) {
        dataService.setDiff('connectedSockets', -1);
        (socket as any).midwayConnect = false;
      }
    };

    this.socketApp.on('connection', async socket => {
      (socket as any).midwayConnect = true;
      dataService.inc('connectTotal', labels);
      dataService.setDiff('connectedSockets', 1);

      socket.on('disconnect', () => {
        dataService.inc('disconnectTotal', labels);
        disconnect(socket);
      });

      const org_emit = socket.emit;
      socket.emit = (event: string, ...data: any[]) => {
        if (!blacklisted_events.has(event)) {
          const labelsWithEvent = { event: event, ...labels };
          dataService.inc(
            'bytesTransmitted',
            labelsWithEvent,
            dataToBytes(data)
          );
          dataService.inc('eventsSentTotal', labelsWithEvent);
        }

        return org_emit.apply(socket, [event, ...data]);
      };

      const org_onevent = (socket as any).onevent;
      (socket as any).onevent = (packet: any) => {
        if (packet && packet.data) {
          const [event, data] = packet.data;
          if (event === 'error') {
            disconnect(socket);
            dataService.inc('errorsTotal', labels);
          } else if (!blacklisted_events.has(event)) {
            const labelsWithEvent = { event: event, ...labels };
            dataService.inc(
              'bytesReceived',
              labelsWithEvent,
              dataToBytes(data)
            );
            dataService.inc('eventsReceivedTotal', labelsWithEvent);
          }
        }

        return org_onevent.call(socket, packet);
      };
    });
  }

  async onStop() {}
}
