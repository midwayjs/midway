declare module 'MidwayCore' {
  export interface IMidwayBaseContext {
    /**
     * Custom properties.
     */
    [key: string]: unknown;
    requestContext: IMidwayContainer;
    logger: ILogger;
    getLogger(name?: string): ILogger;
    startTime: number;
  }
}


