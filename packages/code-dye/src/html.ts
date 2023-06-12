function getInfoResult(info) {
  if (info.end) {
    return `<div class="infoBtn">返回值<div class="infoCard"><pre>${JSON.stringify(
      info.end.result,
      null,
      2
    )}</pre></div></div>`;
  } else {
    return '<div class="infoBtn">未结束</div>';
  }
}

function getInfoTimeUse(info) {
  if (info.end) {
    return info.end.time - info.start.time;
  } else {
    return new Date().getTime() - info.start.time;
  }
}

export const foreach = (info, start, pi, level) => {
  const timeUse = getInfoTimeUse(info);
  const timeDiff = info.start.time - start;
  const paths = info.paths.filter(path => {
    return !path.startsWith('/');
  });
  return `
    <div class="item">
      <div class="info" style="padding-left: ${(level - 1) * 24}px">
        <div class="infoText">${paths.join(' / ')}</div>
        <div class="moreInfo">
          <div class="infoBtn">入参<div class="infoCard"><pre>${JSON.stringify(
            info.start.args,
            null,
            2
          )}</pre></div></div>
          ${getInfoResult(info)}
        </div>
      </div>
      <div class="timeContainer">
        <div class="time ${info.end ? 'end' : 'not-end'}" style="width:${
    timeUse / pi
  }px;left: ${timeDiff / pi}px"><div class="timeValue">${timeUse} ms</div></div>
      </div>

    </div>
    <div class="child">
      <div class="childLine" style="left: ${(level - 1) * 24 + 12}px"></div>
      ${info.call
        .map(info => {
          return foreach(info, start, pi, level + 1);
        })
        .join('')}
      </div>
  `;
};

export const callChain = call => {
  const timeDiff = call.end.time - call.start.time;
  let pi = timeDiff / 600;
  if (pi < 1) {
    pi = 1;
  }
  return `
  <div>
    <div>调用链路总耗时 ${timeDiff}ms<div>
    <div>调用结果:<br /><pre>${JSON.stringify(
      call.end.result,
      null,
      2
    )}</pre></div>
    <hr />
    <div style="padding: 12px;">${foreach(call, call.start.time, pi, 1)}</div>
  </div>
  `;
};

export const toHTML = info => {
  return `
  <title>Midway CodeDye</title>
  <meta charset="utf-8" />
  <style>
  .item {
    display: flex;
    flex-wrap: nowrap;
    height: 24px;
  }
  .info {
    position: relative;
    width: 360px;
    box-sizing: border-box;
    border-right: 1px solid #eee;
    height: 24px;
    padding: 0 12px;
    padding-right: 60px;
  }
  .infoText {
    height: 24px;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 13px;
    line-height: 24px;
    white-space: nowrap;
  }
  .moreInfo {
    position: absolute;
    right: 6px;
    top: 0;
    display: flex;
  }
  .timeContainer {
    position: relative;
    margin-left: 12px;
    height: 24px;
  }
  .time {
    position: absolute;
    height: 16px;
    min-width: 12px;
    background-color: #66c;
    border-radius: 3px;
  }
  .time.not-end {
    background-color: #ddd;
  }

  .timeValue {
    position: absolute;
    line-height: 16px;
    top: 0;
    right: 0;
    transform: translate(110%, 0);
    white-space: nowrap;
  }
  .infoBtn {
    position: relative;
    cursor: pointer;
    margin-left: 6px;
    border-radius: 3px;
    background: #eee;
    padding: 2px;
    line-height: 14px;
    font-size: 12px;
  }
  .infoBtn:hover .infoCard {
    display: block;
  }
  .infoCard {
    display: none;
    position: absolute;
    background: #eee;
    z-index: 3;
    padding: 12px;
  }
  .child {
    position: relative;
  }
  .childLine {
    position: absolute;
    top: 0;
    height: 100%;
    width: 2px;
    border-radius: 3px;
    background: #ccc;
  }
  </style>
  <h1>Midway CodeDye</h1><hr />
  ${info.map(call => callChain(call)).join('')}
  <hr /><a href="https://www.midwayjs.org/">Powered by Midway.js</a>
  `;
};
