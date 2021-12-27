export function detectStatus(err) {
  // detect status
  let status = err.status || 500;
  if (status < 200) {
    // invalid status consider as 500, like urllib will return -1 status
    status = 500;
  }
  return status;
}
