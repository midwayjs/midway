export function sleep(sleepTime: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  });
}
