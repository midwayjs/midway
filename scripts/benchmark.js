'use strict';

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const autocannon = require('autocannon');
const path = require('path');

function wait(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

const cannon = () => {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url: 'http://127.0.0.1:7001',
        connections: 5000,
        pipelining: 2,
        duration: 10,
      },
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

(async () => {
  const child = spawn('node', ['start.js'], { cwd: __dirname });

  child.on('error', err => {
    console.error(err);
  });

  child.on('exit', (code, signal) => {
    console.log(`Exited with code ${code} and signal ${signal}`);
  });

  child.stdout.on('data', data => {
    console.log(data.toString());
  });

  child.stderr.on('data', data => {
    console.log(data.toString());
  });

  console.log(`Waiting for to initialize...`);
  await wait(10000); // wait for workers to properly initialize
  console.log(`Running benchmark...`);
  const results = await cannon();
  console.log(console.log(`QPS:  ${results.requests.average}`));
  await wait(5000);
})().catch(e => console.error(e));
