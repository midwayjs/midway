import type { IMidwayBootstrapOptions } from '@midwayjs/core';
import type { IMidwayLogger } from '@midwayjs/logger';
import { ClusterSettings } from 'cluster';

export interface ForkOptions {
  /**
   * worker num, default is `os.cpus().length`
   */
  count?: number;
  /**
   * refork when disconect and unexpected exit, default is `true`
   */
  refork?: boolean;
  /**
   * restart limit, default is `60`
   */
  limit?: number;

  duration?: number;

  logger?: IMidwayLogger | Console;
}

export type ClusterOptions = ForkOptions & ClusterSettings;

export type ClusterBootstrapOptions = IMidwayBootstrapOptions & ClusterOptions;
