import { AddressInfo, createServer } from 'net';

export function detectStatus(err) {
  // detect status
  let status = err.status || 500;
  if (status < 200) {
    // invalid status consider as 500, like urllib will return -1 status
    status = 500;
  }
  return status;
}

export function accepts(ctx) {
  if (acceptJSON(ctx)) return 'json';
  return 'html';
}

function acceptJSON(ctx) {
  if (ctx.path.endsWith('.json')) return true;
  if (ctx.response.type && ctx.response.type.indexOf('json') >= 0) return true;
  if (ctx.accepts('html', 'text', 'json') === 'json') return true;
  return false;
}

export function sendToWormhole(stream): Promise<void> {
  return new Promise<void>(resolve => {
    if (typeof stream.resume !== 'function') {
      return resolve();
    }

    // unpipe it
    stream.unpipe && stream.unpipe();
    // enable resume first
    stream.resume();

    if (stream._readableState && stream._readableState.ended) {
      return resolve();
    }
    if (!stream.readable || stream.destroyed) {
      return resolve();
    }

    function cleanup() {
      stream.removeListener('end', onEnd);
      stream.removeListener('close', onEnd);
      stream.removeListener('error', onError);
    }

    function onEnd() {
      cleanup();
      resolve();
    }

    function onError() {
      cleanup();
      resolve();
    }

    stream.on('end', onEnd);
    stream.on('close', onEnd);
    stream.on('error', onError);
  });
}

export function isProduction(app) {
  return app.getEnv() !== 'local' && app.getEnv() !== 'unittest';
}

export const tpl = `
<!DOCTYPE html>
<html>
  <head>
    <title>Error - {{status}}</title>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0">

    <style>
      body {
        padding: 50px 80px;
        font: 14px "Helvetica Neue", Helvetica, sans-serif;
      }

      h1 {
        font-size: 2em;
        margin-bottom: 5px;
      }

      pre {
        font-size: .8em;
      }
    </style>
  </head>
  <body>
    <div id="error">
      <h1>Error</h1>
      <p>Looks like something broke!</p>
      <p><h2>Stack</h2></p>
      <pre>
        <code>
{{stack}}
        </code>
      </pre>
      <p><h2>Error Code</h2></p>
      <pre>
        <code>
{{errorCode}}
        </code>
      </pre>
    </div>
  </body>
</html>`;

const matchHtmlRegExp = /["'&<>]/;
/**
 * Escape special characters in the given string of text.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

export function escapeHtml(string) {
  const str = '' + string;
  const match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  let escape;
  let html = '';
  let index = 0;
  let lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

export async function getFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      try {
        const port = (server.address() as AddressInfo).port;
        server.close();
        resolve(port);
      } catch (err) {
        reject(err);
      }
    });
  });
}
