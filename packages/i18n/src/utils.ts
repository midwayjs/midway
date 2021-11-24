const ARRAY_INDEX_RE = /\{(\d+)\}/g;
export function formatWithArray(text, values) {
  return text.replace(ARRAY_INDEX_RE, (orignal, matched) => {
    const index = parseInt(matched);
    if (index < values.length) {
      return values[index];
    }
    // not match index, return original text
    return orignal;
  });
}

const Object_INDEX_RE = /\{(.+?)\}/g;
export function formatWithObject(text, values) {
  return text.replace(Object_INDEX_RE, (orignal, matched) => {
    const value = values[matched];
    if (value) {
      return value;
    }
    // not match index, return original text
    return orignal;
  });
}
