import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as Client from 'prom-client';
import { Master } from '../decorator/master';
import * as PromClient from 'prom-client';

@Provide()
@Scope(ScopeEnum.Singleton)
export class DataService {

  responseSummary: Client.Summary<any>;

  responseHistogram: Client.Histogram<any>;

  @Config("prometheus")
  prometheusConfig;

  bInit = false;

  async init(){
    this.responseSummary = new Client.Summary({
      name: 'http_request_latency_milliseconds',
      help: 'response time in millis',
      labelNames: ['method', 'status', 'uri', ...Object.keys(this.prometheusConfig.labels)]
    })
    this.responseHistogram = new Client.Histogram({
      name: 'http_request_duration_milliseconds',
      help: 'http_request_duration_milliseconds histogram',
      labelNames: ['method', 'status', 'uri', ...Object.keys(this.prometheusConfig.labels)],
      buckets: [5,10,25,50,100,250,500,1000,2500,5000,10000]
    })
    console.log(['method', 'status', 'uri', ...Object.keys(this.prometheusConfig.labels)])
  }

  @Master()
  async getUser(method, status, path, time) {
    if(!this.bInit){
      this.init();
      this.bInit = true;
    }
    this.responseSummary.labels(method, status, path, ...Object.values(this.prometheusConfig.labels) as string[]).observe(time);
    this.responseHistogram.labels(method, status, path, ...Object.values(this.prometheusConfig.labels) as string[]).observe(time);
  }

  @Master()
  async getData(){
    const Register = PromClient.register;
    return Register.metrics();
  }
}
