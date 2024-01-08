module.exports = (context, options) => {
  const arms = `
!(function(c,b,d,a){c[a]||(c[a]={});c[a].config=
  {
    pid:"2oin@b42efb378fd8173",
    appType:"web",
    imgUrl:"",
    sendResource:true,
    enableLinkTrace:true,
    behavior:true,
    enableConsole:true,
    enableSPA:true
  };
with(b)with(body)with(insertBefore(createElement("script"),firstChild))setAttribute("crossorigin","",src=d)
})(window,document,"https://sdk.rum.aliyuncs.com/v1/bl.js","__bl");
`;

  return {
    name: 'docusaurus-plugin-arms',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: arms,
          },
        ],
      };
    },
  };
};
