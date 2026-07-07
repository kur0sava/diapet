/** Test-only expo-crypto backed by node:crypto. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeCrypto = require('node:crypto');

export function randomUUID(): string {
  return nodeCrypto.randomUUID();
}
