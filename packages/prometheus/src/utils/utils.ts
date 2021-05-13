import * as cluster from 'cluster';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

var gfp = null;
var bInit = false;
const ppid = process.ppid;
const now = new Date();
const lockFile = path.join(os.tmpdir(), `midway-master-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${ppid}.lock`);
export function isMaster() {
  if (cluster.isMaster) {
    return true;
  }

  if(process.env[`_`].indexOf('egg-scripts')>=0){
    // Is run with egg-scripts
    if(bInit && gfp){
      return true;
    }else if(bInit){
      return false;
    }else{
      bInit = true;
      try{
        let result = fs.openSync(lockFile,"wx");
        gfp = result;
        return true;
      }catch(e){
        return false;
      }
    }
  }

  if (process.env && process.env.pm_id) {
    //Is run with PM2
    if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
      return true;
    }
  }

  return false;
}

export function closeLock(){
  if(gfp){
    fs.closeSync(gfp);
    fs.unlinkSync(lockFile);
    gfp = null;
  }
}
