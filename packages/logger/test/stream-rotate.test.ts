import { FileStreamRotator } from '../src/fileStreamRotator';

describe('/test/stream-rotate.test.ts', () => {
  it('test every second', async () => {
    const rotator = new FileStreamRotator();
    const rotatingLogStream = rotator.getStream({
      filename: 'logs/1s/testlog-%DATE%.log',
      frequency: 'custom',
      verbose: true,
      date_format: 'YYYY-MM-DD.HH.mm',
      size: '50k',
      max_logs: '5',
      audit_file: '/tmp/audit-1s.json',
      end_stream: false,
      utc: true,
      extension: '.logs',
      watch_log: true
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

    rotatingLogStream.on('addWatcher', function (newLog) {
      console.log(Date.now(), Date(), 'stream add watcher', newLog);
    });

    let counter = 0;
    const i = setInterval(function () {
      counter++;
      // rotatingLogStream.write(Date() + "\ttesting 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
      rotatingLogStream.write(Date() + 'ニューバランスの100年を超える長い歴史\n')
      // if(counter == 2000){
      if (counter == 400) {
        clearInterval(i);
        console.log(Date() + '\tEND STREAM');
        rotatingLogStream.end('end\n');
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

  it('test minute-test', function () {
    const rotator = new FileStreamRotator();
    const rotatingLogStream = rotator.getStream({
      filename: "logs/1m/testlog-%DATE%",
      frequency: "1m",
      verbose: true,
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

// console.log(rotatingLogStream.on, rotatingLogStream.end, rotatingLogStream)


// var rotatingLogStream1 = require('../FileStreamRotator').getStream({
//     filename: "/tmp/a/logs/1m-1/testlog-%DATE%.log",
//     frequency: "1m",
//     verbose: true,
//     date_format: "YYYY-MM-DD.HH.mm",
//     size: "50k",
//     max_logs: "10",
//     audit_file: "/tmp/audit-1.json",
//     end_stream: false
// });

    var counter = 0;
    var i = setInterval(function () {
      counter++;
      rotatingLogStream.write(Date() + "\t" + "testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
      // rotatingLogStream1.write(Date() + "\t" + "testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890-testing 1234567890\n")
      if (counter == 5000) {
        clearInterval(i);
        rotatingLogStream.end("end\n");
        // rotatingLogStream1.end("end\n");
      }
    }, 10);

  });
})
