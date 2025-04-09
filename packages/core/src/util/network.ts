import * as os from 'os';

// get ipv4 and ipv6 address
function getIpv4Address(): string {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    if (interfaces[key]) {
      for (const item of interfaces[key]) {
        if (item.family === 'IPv4' && !item.internal) {
          return item.address;
        }
      }
    }
  }
  return '';
}

function getIpv6Address(): string {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    if (interfaces[key]) {
      for (const item of interfaces[key]) {
        if (item.family === 'IPv6' && !item.internal) {
          return item.address;
        }
      }
    }
  }
  return '';
}

function getHostname(): string {
  return os.hostname();
}

export const NetworkUtils = {
  getIpv4Address,
  getIpv6Address,
  getHostname,
};
