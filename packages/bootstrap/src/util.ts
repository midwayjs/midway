export function logDate() {
  const d = new Date();
  let date: string | number = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  let month: string | number = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  let hours: string | number = d.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  let mintues: string | number = d.getMinutes();
  if (mintues < 10) {
    mintues = '0' + mintues;
  }
  let seconds: string | number = d.getSeconds();
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  let milliseconds: string | number = d.getMilliseconds();
  if (milliseconds < 10) {
    milliseconds = '00' + milliseconds;
  } else if (milliseconds < 100) {
    milliseconds = '0' + milliseconds;
  }
  return (
    d.getFullYear() +
    '-' +
    month +
    '-' +
    date +
    ' ' +
    hours +
    ':' +
    mintues +
    ':' +
    seconds +
    '.' +
    milliseconds
  );
}

export async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}
