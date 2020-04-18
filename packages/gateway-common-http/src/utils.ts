export function getHeaderValue(headers, key) {
  return Array.isArray(headers[key]) && headers[key].length === 1
    ? headers[key][0]
    : headers[key];
}
