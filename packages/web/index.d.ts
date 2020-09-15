///<reference types="egg" />
///<reference path="./dist/index.d.ts" />

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }
}
