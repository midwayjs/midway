import { CORSOptions, JSONPOptions } from "../interface"

export const cors: Partial<CORSOptions> = {
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  credentials: false,
}

export const jsonp: JSONPOptions = {
  callback: 'jsonp',
  limit: 512,
}