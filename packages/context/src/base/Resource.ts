import { URL } from 'url'; // tslint:disable-line
import { existsSync,
  readFileSync,
  lstatSync,
  readdirSync
} from 'fs';
import { resolve, parse, dirname, join } from 'path';
import * as _ from 'lodash';
import { IResource } from '../interfaces';

export class Resource implements IResource {
  private _baseDir: string = null;
  private _path: string = null;
  public encoding: string = 'UTF-8';

  constructor(baseDir: string, path?: string) {
    this._baseDir = baseDir;
    this._path = path || '.'; // baseDir 目录
  }

  getPath(): string {
    if (this._baseDir) {
      return resolve(this._baseDir, this._path);
    }
    return this._path;
  }

  exists(): boolean {
    return existsSync(this.getPath());
  }

  isFile(): boolean {
    const stats = lstatSync(this.getPath());
    return stats.isFile();
  }

  isDir(): boolean {
    const stats = lstatSync(this.getPath());
    return stats.isDirectory();
  }

  isURL(): boolean {
    return this.getPath().indexOf('http') > -1;
  }

  getURL(): any {
    if (this.isURL()) {
      return new URL(this._path);
    }
    return null;
  }

  /**
   * 如果是文件则获取当前文件夹路径
   * 如果是文件夹则直接作为路径
   * @param path 相对路径
   */
  createRelative(path: string): IResource {
    if (this.isFile()) {
      path = join(dirname(this.getPath()), path);
    } else {
      path = join(this.getPath(), path);
    }
    return new Resource(this._baseDir, path);
  }

  getSubResources(): IResource[] {
    if (this.isDir()) {
      const files: string[] = readdirSync(this.getPath());
      const arr = _.map(files, file => {
        return new Resource(this.getPath(), file);
      });

      return arr;
    }
    return [];
  }

  getContent(): Buffer {
    if (!this.exists()) {
      throw new Error(`${this.getPath()} not found!`);
    }
    if (!this.isFile()) {
      throw new Error(`${this.getPath()} is not a file!`);
    }
    return readFileSync(this.getPath());
  }

  getContentAsJSON(): Object {
    if (!this.exists()) {
      throw new Error(`${this.getPath()} not found!`);
    }
    if (!this.isFile()) {
      throw new Error(`${this.getPath()} is not a file!`);
    }
    if (parse(this.getPath()).ext === '.json') {
      const buf = readFileSync(this.getPath());
      try {
        return JSON.parse(buf.toString());
      } catch (e) {}
      return {};
    }
    return require(this.getPath());
  }

  get name(): string {
    if (this.exists()) {
      return parse(this.getPath()).name;
    }
    return null;
  }

  get contentLength(): number {
    if (this.exists()) {
      const buf = readFileSync(this.getPath());
      return buf.length;
    }
    return 0;
  }

  get lastModified(): number {
    if (this.exists()) {
      const stats = lstatSync(this.getPath());
      return stats.mtime.getTime();
    }
    return 0;
  }
}
