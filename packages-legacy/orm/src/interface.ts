import { createConnection } from 'typeorm';

export type ConnectionOptions = Parameters<typeof createConnection>[0];
