// value from ms package
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

const MS = {
  ONE_SECOND: s,
  ONE_MINUTE: m,
  ONE_HOUR: h,
  ONE_DAY: d,
  ONE_WEEK: w,
  ONE_YEAR: y,
};

// crontab pre format
const CRONTAB = {
  EVERY_SECOND: '* * * * * *',
  EVERY_MINUTE: '0 * * * * *',
  EVERY_HOUR: '0 0 * * * *',
  EVERY_DAY: '0 0 0 * * *',
  EVERY_DAY_ZERO_FIFTEEN: '0 15 0 * * *',
  EVERY_DAY_ONE_FIFTEEN: '0 15 1 * * *',
  EVERY_PER_5_SECOND: '*/5 * * * * *',
  EVERY_PER_10_SECOND: '*/10 * * * * *',
  EVERY_PER_30_SECOND: '*/30 * * * * *',
  EVERY_PER_5_MINUTE: '0 */5 * * * *',
  EVERY_PER_10_MINUTE: '0 */10 * * * *',
  EVERY_PER_30_MINUTE: '0 */30 * * * *',
};

export const FORMAT = {
  MS,
  CRONTAB,
};
