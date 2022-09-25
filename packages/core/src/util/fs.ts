import { constants, promises } from 'fs';

export async function exists(p) {
  return promises
    .access(p, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export const FileUtils = {
  exists,
};
