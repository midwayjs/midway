'use strict';
const opentelemetry = require('@opentelemetry/sdk-trace-node');
const sdk = new opentelemetry.NodeTracerProvider({});
sdk.register();

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
