import type { QueueAdapterOptions, UIConfig } from "@bull-board/api/dist/typings/app";

export interface BullBoardOption {
  package?: 'bull' | 'bullmq';
  basePath?: string;
  uiConfig?: UIConfig;
  adapterOptions?: QueueAdapterOptions;
}