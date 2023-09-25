export interface HttpResponseOptions {
  writeableImpl?: {
    write: (chunk: any, encoding?: string) => void;
    end: (chunk?: any, encoding?: string) => void;
  }
}
