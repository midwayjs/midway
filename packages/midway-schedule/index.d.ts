declare module 'egg' {
  export interface Application {
    runSchedule(schedulePath: any): Promise<any>;
  }
}
