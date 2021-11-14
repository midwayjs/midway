import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as Client from 'prom-client';
import { Master } from '../decorator/master';
import * as PromClient from 'prom-client';

@Provide()
@Scope(ScopeEnum.Singleton)
export class DataService {
  responseSummary: Client.Summary<any>;

  responseHistogram: Client.Histogram<any>;

  userDefinedMetrics: any = {};

  metrics: any;

  @Config('prometheus')
  prometheusConfig;

  bInit = false;

  async init() {
    this.responseSummary = new Client.Summary({
      name: 'http_request_latency_milliseconds',
      help: 'response time in millis',
      labelNames: [
        'method',
        'status',
        'uri',
        ...Object.keys(this.prometheusConfig.labels),
      ],
    });
    this.responseHistogram = new Client.Histogram({
      name: 'http_request_duration_milliseconds',
      help: 'http_request_duration_milliseconds histogram',
      labelNames: [
        'method',
        'status',
        'uri',
        ...Object.keys(this.prometheusConfig.labels),
      ],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    });
  }

  @Master()
  async getUser(method, status, path, time) {
    if (!this.bInit) {
      this.init();
      this.bInit = true;
    }
    this.responseSummary
      .labels(
        method,
        status,
        path,
        ...(Object.values(this.prometheusConfig.labels) as string[])
      )
      .observe(time);
    this.responseHistogram
      .labels(
        method,
        status,
        path,
        ...(Object.values(this.prometheusConfig.labels) as string[])
      )
      .observe(time);
  }

  define(name, type, options) {
    options.labelNames = options.labelNames
      ? [...options.labelNames, ...Object.keys(this.prometheusConfig.labels)]
      : Object.keys(this.prometheusConfig.labels);
    this.userDefinedMetrics[name] = new Client[type](options);
  }

  @Master()
  async inc(name, labels, value = 1) {
    this.userDefinedMetrics[name].inc(
      { ...labels, ...this.prometheusConfig.labels },
      value
    );
  }

  @Master()
  async set(name, value) {
    this.userDefinedMetrics[name].set(
      { ...this.prometheusConfig.labels },
      value
    );
  }

  @Master()
  async setDiff(name, diff) {
    const current = await this.userDefinedMetrics[name].get();
    let value = diff;
    if (current.values.length !== 0) {
      value = current.values[0].value + diff;
    }
    this.userDefinedMetrics[name].set(
      { ...this.prometheusConfig.labels },
      value
    );
  }

  @Master()
  async getData() {
    const Register = PromClient.register;
    return Register.metrics();
  }
}
