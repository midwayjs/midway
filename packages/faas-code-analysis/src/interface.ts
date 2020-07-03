export type IParam = string | string[];
export interface IResult {
  functions: {
    [functionName: string]: IFunction;
  };
}

export interface IFunction {
  handler: string;
  events: IEvent[];
}

export interface IEvent {
  http?: {
    method: string | string[];
    path: string;
  };
  [othEvent: string]: any;
}
