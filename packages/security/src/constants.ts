// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy
export const ALLOWED_POLICIES_ENUM = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
  '',
] as const;

export const METHODS_NOT_ALLOWED = ['trace', 'track'];
