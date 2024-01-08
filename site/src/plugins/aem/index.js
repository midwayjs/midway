module.exports = (context, options) => {
  const initScripts = `

const aes = new AES({
  pid: "sM3ime",
  user_type: "101",
});

globalThis.pv = aes.use([AESPluginPV], {
  autoPV: false,
  autoLeave: false,
})[0];

aes.use([AESPluginPV])
`;

  const aplus = `
  (function(w, d, s, q, i) {
    w[q] = w[q] || [];
    var f = d.getElementsByTagName(s)[0],j = d.createElement(s);
    j.async = true;
    j.id = 'beacon-aplus';
    j.setAttribute('exparams','userid=&aplus&sidx=aplusSidex&ckx=aplusCkx');
    j.src = "//g.alicdn.com/alilog/mlog/aplus_v2.js";
    j.crossorigin = 'anonymous';
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'aplus_queue');
`;

  return {
    name: 'docusaurus-plugin-aem',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'aplus-core',
              content: 'aplus.js',
            },
          },
          {
            tagName: 'script',
            innerHTML: aplus,
          },
          {
            tagName: 'script',
            attributes: {
              src: '//g.alicdn.com/aes/??tracker/3.3.3/index.js,tracker-plugin-pv/3.0.5/index.js',
            },
          },
          {
            tagName: 'script',
            innerHTML: initScripts,
          },
        ],
      };
    },
    getClientModules() {
      return ['./client.js'];
    },
  };
};
