import * as cluster from 'cluster';

export function isMaster() {
  if (cluster.isMaster) {
    return true;
  }

  if (process.env && process.env.pm_id) {
    //Is run with PM2
    if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
      return true;
    }
  }

  return false;
}
