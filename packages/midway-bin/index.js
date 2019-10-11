'use strict';

const Command = require('egg-bin/lib/command');
const path = require('path');

class MidwayBin extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin [command] [options]';
    // load directory
    this.load(path.join(__dirname, 'lib/cmd'));
  }
}

exports.MidwayBin = MidwayBin;
exports.AutodCommand = require('./lib/cmd/autod');
exports.BuildCommand = require('./lib/cmd/build');
exports.CovCommand = require('./lib/cmd/cov');
exports.DevCommand = require('./lib/cmd/dev');
exports.TestCommand = require('./lib/cmd/test');
exports.DebugCommand = require('./lib/cmd/debug');
exports.PkgfilesCommand = require('./lib/cmd/pkgfiles');
exports.CleanCommand = require('./lib/cmd/clean');
exports.DocCommand = require('./lib/cmd/doc');
exports.resolveModule = require('./lib/util').resolveModule;
