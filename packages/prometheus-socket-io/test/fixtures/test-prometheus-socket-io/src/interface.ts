export enum SocketRequestEvent {
  GREET = 'greet',
}

export enum SocketResponseEvent {
  GREET = 'greetResult',
}

export interface IUserOptions {
  uid: string;
}

export interface IGetUserResponse {
  success: boolean;
  message: string;
  data: IUserOptions;
}
