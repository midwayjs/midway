#!/usr/bin/env node
'use strict';

const { join } = require('path');
// eslint-disable-next-line node/no-unpublished-require
const { CommandUtils } = require('typeorm/commands/CommandUtils');
// eslint-disable-next-line node/no-unpublished-require
const ImportUtils = require('typeorm/util/ImportUtils');
// eslint-disable-next-line node/no-unpublished-require
const { DataSource } = require('typeorm');

const originLoadDataSource = CommandUtils.loadDataSource;

CommandUtils.loadDataSource = async function (dataSourceFilePath) {
  try {
    let dataSourceFileExports = await ImportUtils.importOrRequireFile(
      dataSourceFilePath
    );
    if (dataSourceFileExports[0] && dataSourceFileExports[0].default) {
      dataSourceFileExports = dataSourceFileExports[0].default;
      if (typeof dataSourceFileExports === 'function') {
        dataSourceFileExports = dataSourceFileExports({
          appDir: process.cwd(),
          baseDir: join(process.cwd(), 'src'),
        });
      }
      if (dataSourceFileExports['typeorm']) {
        dataSourceFileExports = dataSourceFileExports['typeorm'];
        dataSourceFileExports =
          dataSourceFileExports.dataSource[
            dataSourceFileExports['defaultClientName'] || 'default'
          ];

        return new DataSource(dataSourceFileExports);
      } else {
        console.log(
          '[midway:typeorm] Not found dataSource options and run origin loadDataSource method'
        );
        return originLoadDataSource(dataSourceFilePath);
      }
    }
  } catch (err) {
    throw new Error(
      `Unable to open file: "${dataSourceFilePath}". ${err.message}`
    );
  }
};

// eslint-disable-next-line node/no-unpublished-require
require('typeorm/cli-ts-node-commonjs');
