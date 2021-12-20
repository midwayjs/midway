const ARRAY_INDEX_RE = /\{(\d+)\}/g;
export function formatWithArray(text, values) {
  return text.replace(ARRAY_INDEX_RE, (original, matched) => {
    const index = parseInt(matched);
    if (index < values.length) {
      return values[index];
    }
    // not match index, return original text
    return original;
  });
}

const Object_INDEX_RE = /\{(.+?)\}/g;
export function formatWithObject(text, values) {
  return text.replace(Object_INDEX_RE, (original, matched) => {
    const value = values[matched];
    if (value) {
      return value;
    }
    // not match index, return original text
    return original;
  });
}

export function formatLocale(locale: string) {
  // support zh_CN, en_US => zh-CN, en-US
  return locale.replace('_', '-').toLowerCase();
}
