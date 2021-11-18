import { DefaultMetricsCollectorConfiguration } from 'prom-client';

export const prometheus: DefaultMetricsCollectorConfiguration = {
  labels: {
    APP_NAME: 'default',
  },
};
