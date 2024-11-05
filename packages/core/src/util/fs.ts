import { readdirSync } from 'fs';

export async function exists(p) {
  try{
    readdirSync(p)
    return true
  }catch(e){
    return false
  }
}

export const FileUtils = {
  exists,
};
