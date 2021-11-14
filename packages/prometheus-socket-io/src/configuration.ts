import {
  App,
  Configuration,
  Inject,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { DataService } from '@midwayjs/prometheus';
import * as prometheus from '@midwayjs/prometheus';

@Configuration({
  imports: [prometheus],
  namespace: 'prometheus-socket-io',
})
export class PrometheusSocketIOConfiguration {
  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;

  @Inject()
  dataService: DataService;

  async onReady() {
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
    this.dataService.define('connectedSockets', 'Gauge', {
      name: 'socket_io_connected',
      help: 'Number of currently connected sockets',
    });

    this.dataService.define('connectTotal', 'Counter', {
      name: 'socket_io_connect_total',
      help: 'Total count of socket.io connection requests',
      labelNames: ['namespace'],
    });

    this.dataService.define('disconnectTotal', 'Counter', {
      name: 'socket_io_disconnect_total',
      help: 'Total count of socket.io disconnections',
      labelNames: ['namespace'],
    });

    this.dataService.define('bytesTransmitted', 'Counter', {
      name: 'socket_io_transmit_bytes',
      help: 'Total socket.io bytes transmitted',
      labelNames: ['event', 'namespace'],
    });

    this.dataService.define('eventsSentTotal', 'Counter', {
      name: 'socket_io_events_sent_total',
      help: 'Total count of socket.io sent events',
      labelNames: ['event', 'namespace'],
    });

    this.dataService.define('errorsTotal', 'Counter', {
      name: 'socket_io_errors_total',
      help: 'Total socket.io errors',
      labelNames: ['namespace'],
    });

    this.dataService.define('bytesReceived', 'Counter', {
      name: 'socket_io_receive_bytes',
      help: 'Total socket.io bytes received',
      labelNames: ['event', 'namespace'],
    });

    this.dataService.define('eventsReceivedTotal', 'Counter', {
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
        this.dataService.setDiff('connectedSockets', -1);
        (socket as any).midwayConnect = false;
      }
    };

    this.socketApp.on('connection', async socket => {
      (socket as any).midwayConnect = true;
      this.dataService.inc('connectTotal', labels);
      this.dataService.setDiff('connectedSockets', 1);

      socket.on('disconnect', () => {
        this.dataService.inc('disconnectTotal', labels);
        disconnect(socket);
      });

      const org_emit = socket.emit;
      socket.emit = (event: string, ...data: any[]) => {
        if (!blacklisted_events.has(event)) {
          const labelsWithEvent = { event: event, ...labels };
          this.dataService.inc(
            'bytesTransmitted',
            labelsWithEvent,
            dataToBytes(data)
          );
          this.dataService.inc('eventsSentTotal', labelsWithEvent);
        }

        return org_emit.apply(socket, [event, ...data]);
      };

      const org_onevent = (socket as any).onevent;
      (socket as any).onevent = (packet: any) => {
        if (packet && packet.data) {
          const [event, data] = packet.data;
          if (event === 'error') {
            disconnect(socket);
            this.dataService.inc('errorsTotal', labels);
          } else if (!blacklisted_events.has(event)) {
            const labelsWithEvent = { event: event, ...labels };
            this.dataService.inc(
              'bytesReceived',
              labelsWithEvent,
              dataToBytes(data)
            );
            this.dataService.inc('eventsReceivedTotal', labelsWithEvent);
          }
        }

        return org_onevent.call(socket, packet);
      };
    });
  }

  async onStop() {}
}
