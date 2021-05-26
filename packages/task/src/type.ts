export interface IQueue {
  execute(data): Promise<void>;
}
