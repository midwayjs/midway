import { TypeInfo } from './interface';

export function safeRequire(mod: string, defaultValue?) {
  try {
    return require(mod);
  } catch (e) {
    return defaultValue;
  }
}

export function bitToMB(bit: number): string {
  return Number((bit || 0) / 1024 / 1024).toFixed(2) + ' MB';
}

export function renderToHtml(infoList: TypeInfo[], title): string {
  let html = `<div style="padding: 24px; font-size: 36px;background: #9999cb;font-weight: bold;">${title}</div>`;
  html += infoList
    .map(info => {
      const infoList = Object.keys(info.info || {});
      return `<div class="infoType">${info.type}</div>
    <table style="border-collapse: collapse;width: 100%;">${infoList
      .map(infoName => {
        return `<tr style="border: 1px solid #666;"><td class="infoName">${infoName}</td><td class="infoValue">${info.info[infoName]}</td></tr>`;
      })
      .join('')}</table>`;
    })
    .join('');
  return `<style>
  .infoType {background: #8e8dc5;margin-top: 24px;padding: 12px;font-weight: bold;font-size: 16px;}
  .infoName {font-weight:bold;vertical-align: top;background:#c2c6fc;width: 200px;word-break:break-all;padding: 12px;}
  .infoValue {vertical-align: top;background:#d8d8d8;padding: 12px;word-break:break-all;}
  </style><div style="margin: 24px auto;max-width: 720px;min-width: 440px;">${html}</div>`;
}

export function safeContent(value = '') {
  if (value.length < 3) {
    return '*'.repeat(value.length);
  } else if (value.length < 6) {
    return value[0] + '*'.repeat(value.length - 1);
  } else if (value.length < 10) {
    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
  } else if (value.length < 15) {
    return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
  } else {
    return value.slice(0, 3) + '*'.repeat(value.length - 6) + value.slice(-3);
  }
}
