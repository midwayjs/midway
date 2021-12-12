export const session = {
  enable: true,
  maxAge: 24 * 3600 * 1000, // ms
  key: 'MW_SESS',
  httpOnly: true,
  // sameSite: null,
  logValue: true,
};
