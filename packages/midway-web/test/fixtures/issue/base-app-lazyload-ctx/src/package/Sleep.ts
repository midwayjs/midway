export default function sleep(timerout = 1000) {
  return new Promise(res => {
    setTimeout(res, timerout);
  });
}
