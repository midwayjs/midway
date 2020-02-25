class PkgfilesCommand extends require('egg-bin').PkgfilesCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin pkgfiles';
  }
}


module.exports = PkgfilesCommand;
