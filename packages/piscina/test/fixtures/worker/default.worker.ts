/**
 * Default export worker (TypeScript)
 */
export default async function (payload?: { value: number }) {
  return (payload?.value || 0) * 4;
}
