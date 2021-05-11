import { DefaultMetricsCollectorConfiguration as DefaultConfig } from 'prom-client';

export const prometheus: DefaultConfig = {
  labels: {
    APP_NAME: 'default',
  },
};
