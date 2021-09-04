import { FileStreamRotator } from '../src/fileStreamRotator';
import * as crypto from 'crypto';
import { writeFileSync, remove, ensureFile, lstat, readdirSync } from 'fs-extra';
import { join } from 'path';
import { createChildProcess, sleep } from './util';

describe('/test/stream-rotate.test.ts', () => {

  beforeEach(async () => {
    await remove(join(__dirname, 'logs'));
  });

  it('test every second', async () => {
    const rotator = new FileStreamRotator();
    const rotatingLogStream = rotator.getStream({
      filename: 'logs/1s/testlog-%DATE%.log',
      frequency: 'custom',
      date_format: 'YYYY-MM-DD.HH.mm',
      size: '50k',
      max_logs: '5',
      audit_file: '/tmp/audit-1s.json',
      end_stream: false,
      utc: true,
      extension: '.logs',
    });

    rotatingLogStream.on('error', function (err) {
      console.log(Date.now(), Date(), 'stream error', err)
      process.exit()
    });

    rotatingLogStream.on('close', function () {
      console.log(Date.now(), Date(), 'stream closed')
    });

    rotatingLogStream.on('finish', function () {
      console.log(Date.now(), Date(), 'stream finished')
    });

    rotatingLogStream.on('rotate', function (oldFile, newFile) {
      console.log(Date.now(), Date(), 'stream rotated', oldFile, newFile);
    });

    rotatingLogStream.on('open', function (fd) {
      console.log(Date.now(), Date(), 'stream open', fd);
    });

    rotatingLogStream.on('new', function (newFile) {
      console.log(Date.now(), Date(), 'stream new', newFile);
    });

    await new Promise<void>(resolve => {
      let counter = 0;
      const i = setInterval( () => {
        counter++;
        // rotatingLogStream.write(Date() + "\ttesting 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
        rotatingLogStream.write(Date() + 'ニューバランスの100年を超える長い歴史\n')
        // if(counter == 2000){
        if (counter == 400) {
          clearInterval(i);
          console.log(Date() + '\tEND STREAM');
          rotatingLogStream.end('end\n');
          resolve();
          return;
        }

        rotatingLogStream.write(Date() + '\t');
        for (let y = 0; y < 400; y++) {
          // console.log(i + " ")
          // rotatingLogStream.write(y + ": " + Date.now() + " >> ");
          rotatingLogStream.write('適: ' + Date.now() + ' >> ');
        }
        rotatingLogStream.write('\n');
      }, 10);
    })
  })

  it('test minute-test',  async () => {
    const rotator = new FileStreamRotator();
    const rotatingLogStream = rotator.getStream({
      filename: "logs/1m/testlog-%DATE%",
      frequency: "1m",
      date_format: "YYYY-MM-DD.HH.mm",
      size: "500k",
      max_logs: "10",
      audit_file: "/tmp/audit.json",
      end_stream: false,
      utc: true,
      extension: ".log",
      create_symlink: true,
      symlink_name: "tail.log"
    });

    rotatingLogStream.on("error", function () {
      console.log(Date.now(), Date(), "stream error", arguments)
    })


    rotatingLogStream.on("close", function () {
      console.log(Date.now(), Date(), "stream closed")
    })

    rotatingLogStream.on("finish", function () {
      console.log(Date.now(), Date(), "stream finished")
    })

    rotatingLogStream.on("rotate", function (oldFile, newFile) {
      console.log(Date.now(), Date(), "stream rotated", oldFile, newFile);
    })

    rotatingLogStream.on("open", function (fd) {
      console.log(Date.now(), Date(), "stream open", fd);
    })

    rotatingLogStream.on("new", function (newFile) {
      console.log(Date.now(), Date(), "stream new", newFile);
    })

    rotatingLogStream.on("logRemoved", function (newFile) {
      console.log(Date.now(), Date(), "stream logRemoved", newFile);
    })

    await new Promise<void>(resolve => {
      var counter = 0;
      var i = setInterval(function () {
        counter++;
        rotatingLogStream.write(Date() + "\t" + "testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
        // rotatingLogStream1.write(Date() + "\t" + "testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
        if (counter == 5000) {
          clearInterval(i);
          rotatingLogStream.end("end\n");
          // rotatingLogStream1.end("end\n");
          resolve();
        }
      }, 10);
    });

  });

  it('should test large', async () => {

    const buffer: Buffer = await new Promise(resolve => {
      crypto.randomBytes(1048, (err, buffer) => {
        resolve(buffer);
      });
    });

    const token = buffer.toString('hex');
    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: './logs/application-%DATE%',
      frequency: 'custom',
      // size: '50k',
      max_logs: 4,
      end_stream: true,
      extension: ".log",
      create_symlink: true
    });
    let count = 0;
    const i = setInterval(() => {
      // console.log("count: ", count)
      if (count > 300) {
        return clear()
      }
      count++;
      for (let i = 0; i < 1; i++) {
        logStream.write(token + "\n");
      }
    },10);

    function clear(){
      console.log("clearing interval")
      clearInterval(i)
      logStream.end("end");
    }
  });

  it('should test rotate log when file has limit size', async () => {
    // 测试当没有日志切割规则只有大小规则，初始化文件达到限制大小，是否能正确切割
    const buffer: Buffer = await new Promise(resolve => {
      crypto.randomBytes(1048, (err, buffer) => {
        resolve(buffer);
      });
    });

    const logFile = join(__dirname, 'logs/test.log');
    const newLogFile = join(__dirname, 'logs/test.log.1');
    const token = buffer.toString('hex');
    await ensureFile(logFile);
    writeFileSync(logFile, token);

    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: logFile,
      size: '2k',
      end_stream: true,
    });

    let i = 100;
    while(i-- >= 0) {
      logStream.write('hello world\n');
    }

    logStream.end();
    await sleep();
    expect((await lstat(logFile)).size).toEqual(2096);
    expect((await lstat(newLogFile)).size).toEqual(1212);
  });

  it('should test rotate log when file has limit size2', async () => {
    // 测试当没有日志切割规则只有大小规则，初始化文件未达到限制大小，再写一点看是否能正确切割
    const buffer: Buffer = await new Promise(resolve => {
      crypto.randomBytes(1000, (err, buffer) => {
        resolve(buffer);
      });
    });

    const logFile = join(__dirname, 'logs/test.log');
    const newLogFile = join(__dirname, 'logs/test.log.1');
    const token = buffer.toString('hex');
    await ensureFile(logFile);
    writeFileSync(logFile, token);

    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: logFile,
      size: '2k',
      end_stream: true,
    });

    let i = 100;
    while(i-- >= 0) {
      logStream.write('hello world\n');
    }

    logStream.end();
    await sleep();
    expect((await lstat(logFile)).size).toEqual(2060);
    expect((await lstat(newLogFile)).size).toEqual(1152);
  });

  it('should test write big data over limit', async () => {
    const buffer: Buffer = await new Promise(resolve => {
      crypto.randomBytes(400, (err, buffer) => {
        resolve(buffer);
      });
    });

    const logFile = join(__dirname, 'logs/test.log');
    const newLogFile = join(__dirname, 'logs/test.log.1');
    const token = buffer.toString('hex');
    await ensureFile(logFile);

    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: logFile,
      size: '1k',
      end_stream: true,
    });

    // 第一次写入 800k
    logStream.write(token);
    // 第二次写入 800k，这个时候应该都在第一个文件
    logStream.write(token);
    // 第三次写入 800k，超过第一个文件的大小，写入第二个文件
    logStream.write(token);
    logStream.end();
    await sleep();

    expect((await lstat(logFile)).size).toEqual(1600);
    expect((await lstat(newLogFile)).size).toEqual(800);
  });

  it('should test rotate log when frequency set ', async () => {
    const logFile = join(__dirname, 'logs/test.log');
    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: logFile,
      frequency: '5s',
      date_format: 'YYYY-MM-DD-HHmmss',
      end_stream: true,
    });

    for (let i = 0; i < 10; i++) {
      logStream.write('hello world\n');
      await sleep();
    }
    logStream.end();

    const files = readdirSync(join(__dirname, 'logs'))
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it('should rotate log by size in cluster', async () => {
    // const logFile = join(__dirname, 'logs/test.log');
    const clusterFile = join(__dirname, 'fixtures/cluster-rotate.ts');
    const child = createChildProcess(clusterFile);
    await new Promise<any>(resolve => {
      child.on('message', pidList => {
        resolve(pidList);
      });
    });

    await new Promise<void>(resolve => {
      child.on('exit', () => {
        // 等进程退出
        resolve();
      });
    });

    const files = readdirSync(join(__dirname, 'logs'))
    expect(files.length).toBeGreaterThanOrEqual(10);
  });
})
