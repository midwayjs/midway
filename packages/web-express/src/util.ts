export function sendData(res, data) {
  if (typeof data === 'number') {
    res.status(res.statusCode).send('' + data);
  } else {
    res.status(res.statusCode).send(data);
  }
}
