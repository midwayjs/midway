"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[98287],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>c});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),s=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},m=function(e){var t=s(e.components);return a.createElement(o.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),k=s(n),d=r,c=k["".concat(o,".").concat(d)]||k[d]||u[d]||l;return n?a.createElement(c,p(p({ref:t},m),{},{components:n})):a.createElement(c,p({ref:t},m))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,p=new Array(l);p[0]=d;var i={};for(var o in t)hasOwnProperty.call(t,o)&&(i[o]=t[o]);i.originalType=e,i[k]="string"==typeof e?e:r,p[1]=i;for(var s=2;s<l;s++)p[s]=n[s];return a.createElement.apply(null,p)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},15293:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>p,default:()=>u,frontMatter:()=>l,metadata:()=>i,toc:()=>s});var a=n(87462),r=(n(67294),n(3905));const l={},p="Koa",i={unversionedId:"extensions/koa",id:"extensions/koa",title:"Koa",description:"Koa \u662f\u4e00\u4e2a\u975e\u5e38\u8f7b\u91cf\u6613\u7528\u7684 Web \u6846\u67b6\u3002\u672c\u7ae0\u8282\u5185\u5bb9\uff0c\u4e3b\u8981\u4ecb\u7ecd\u5728 Midway \u4e2d\u5982\u4f55\u4f7f\u7528 Koa \u4f5c\u4e3a\u4e0a\u5c42\u6846\u67b6\uff0c\u5e76\u4f7f\u7528\u81ea\u8eab\u7684\u80fd\u529b\u3002",source:"@site/docs/extensions/koa.md",sourceDirName:"extensions",slug:"/extensions/koa",permalink:"/docs/extensions/koa",draft:!1,editUrl:"https://github.com/midwayjs/midway/tree/main/site/docs/extensions/koa.md",tags:[],version:"current",frontMatter:{},sidebar:"component",previous:{title:"JWT",permalink:"/docs/extensions/jwt"},next:{title:"EggJS",permalink:"/docs/extensions/egg"}},o={},s=[{value:"\u5b89\u88c5\u4f9d\u8d56",id:"\u5b89\u88c5\u4f9d\u8d56",level:2},{value:"\u5f00\u542f\u7ec4\u4ef6",id:"\u5f00\u542f\u7ec4\u4ef6",level:2},{value:"BodyParser",id:"bodyparser",level:2},{value:"Cookie \u548c Session",id:"cookie-\u548c-session",level:2},{value:"\u6269\u5c55 Context",id:"\u6269\u5c55-context",level:2},{value:"\u83b7\u53d6 Http Server",id:"\u83b7\u53d6-http-server",level:2},{value:"State \u7c7b\u578b\u5b9a\u4e49",id:"state-\u7c7b\u578b\u5b9a\u4e49",level:2},{value:"\u914d\u7f6e",id:"\u914d\u7f6e",level:2},{value:"\u9ed8\u8ba4\u914d\u7f6e",id:"\u9ed8\u8ba4\u914d\u7f6e",level:3},{value:"\u4fee\u6539\u7aef\u53e3",id:"\u4fee\u6539\u7aef\u53e3",level:3},{value:"\u5168\u5c40\u524d\u7f00",id:"\u5168\u5c40\u524d\u7f00",level:3},{value:"\u53cd\u5411\u4ee3\u7406\u914d\u7f6e",id:"\u53cd\u5411\u4ee3\u7406\u914d\u7f6e",level:3},{value:"Https \u914d\u7f6e",id:"https-\u914d\u7f6e",level:3},{value:"favicon \u8bbe\u7f6e",id:"favicon-\u8bbe\u7f6e",level:3},{value:"\u4fee\u6539\u4e0a\u4e0b\u6587\u65e5\u5fd7",id:"\u4fee\u6539\u4e0a\u4e0b\u6587\u65e5\u5fd7",level:3},{value:"Query \u6570\u7ec4\u89e3\u6790",id:"query-\u6570\u7ec4\u89e3\u6790",level:3},{value:"\u8d85\u65f6\u914d\u7f6e",id:"\u8d85\u65f6\u914d\u7f6e",level:3}],m={toc:s},k="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"koa"},"Koa"),(0,r.kt)("p",null,"Koa \u662f\u4e00\u4e2a\u975e\u5e38\u8f7b\u91cf\u6613\u7528\u7684 Web \u6846\u67b6\u3002\u672c\u7ae0\u8282\u5185\u5bb9\uff0c\u4e3b\u8981\u4ecb\u7ecd\u5728 Midway \u4e2d\u5982\u4f55\u4f7f\u7528 Koa \u4f5c\u4e3a\u4e0a\u5c42\u6846\u67b6\uff0c\u5e76\u4f7f\u7528\u81ea\u8eab\u7684\u80fd\u529b\u3002"),(0,r.kt)("p",null,"Midway \u9ed8\u8ba4\u7684\u793a\u4f8b\u90fd\u662f\u57fa\u4e8e\u8be5\u5305\u3002"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa")," \u5305\u9ed8\u8ba4\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"koa@2")," \u4ee5\u53ca\u96c6\u6210\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"@koa/router")," \u4f5c\u4e3a\u8def\u7531\u57fa\u7840\u80fd\u529b\uff0c\u5e76\u9ed8\u8ba4\u5185\u7f6e\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"session")," \u548c ",(0,r.kt)("inlineCode",{parentName:"p"},"body-parser")," \u529f\u80fd\u3002"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"\u63cf\u8ff0"),(0,r.kt)("th",{parentName:"tr",align:null}))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\u5305\u542b\u72ec\u7acb\u4e3b\u6846\u67b6"),(0,r.kt)("td",{parentName:"tr",align:null},"\u2705")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\u5305\u542b\u72ec\u7acb\u65e5\u5fd7"),(0,r.kt)("td",{parentName:"tr",align:null},"\u2705")))),(0,r.kt)("h2",{id:"\u5b89\u88c5\u4f9d\u8d56"},"\u5b89\u88c5\u4f9d\u8d56"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"$ npm i @midwayjs/koa@3 --save\n")),(0,r.kt)("p",null,"\u6216\u8005\u5728 ",(0,r.kt)("inlineCode",{parentName:"p"},"package.json")," \u4e2d\u589e\u52a0\u5982\u4e0b\u4f9d\u8d56\u540e\uff0c\u91cd\u65b0\u5b89\u88c5\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "dependencies": {\n    "@midwayjs/koa": "^3.0.0",\n    // ...\n  },\n}\n')),(0,r.kt)("p",null,"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528\u811a\u624b\u67b6\u521b\u5efa\u793a\u4f8b\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"# npm v6\n$ npm init midway --type=koa-v3 my_project\n\n# npm v7\n$ npm init midway -- --type=koa-v3 my_project\n")),(0,r.kt)("h2",{id:"\u5f00\u542f\u7ec4\u4ef6"},"\u5f00\u542f\u7ec4\u4ef6"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Configuration, App } from '@midwayjs/core';\nimport * as koa from '@midwayjs/koa';\nimport { join } from 'path';\n\n@Configuration({\n  imports: [koa],\n  importConfigs: [join(__dirname, './config')],\n})\nexport class MainConfiguration {\n  @App()\n  app: koa.Application;\n\n  async onReady() {\n        // ...\n  }\n}\n\n")),(0,r.kt)("h2",{id:"bodyparser"},"BodyParser"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa")," \u81ea\u5e26  ",(0,r.kt)("inlineCode",{parentName:"p"},"bodyParser")," \u529f\u80fd\uff0c\u9ed8\u8ba4\u4f1a\u89e3\u6790 ",(0,r.kt)("inlineCode",{parentName:"p"},"Post")," \u8bf7\u6c42\uff0c\u81ea\u52a8\u8bc6\u522b ",(0,r.kt)("inlineCode",{parentName:"p"},"json")," \u548c ",(0,r.kt)("inlineCode",{parentName:"p"},"form")," \u7c7b\u578b\u3002"),(0,r.kt)("p",null,"\u5982\u9700 text \u6216\u8005 xml\uff0c\u53ef\u4ee5\u81ea\u884c\u914d\u7f6e\u3002"),(0,r.kt)("p",null,"\u9ed8\u8ba4\u7684\u5927\u5c0f\u9650\u5236\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"1mb"),"\uff0c\u53ef\u4ee5\u5355\u72ec\u5bf9\u6bcf\u9879\u914d\u7f6e\u5927\u5c0f\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  bodyParser: {\n    enableTypes: ['json', 'form', 'text', 'xml'],\n    formLimit: '1mb',\n    jsonLimit: '1mb',\n    textLimit: '1mb',\n    xmlLimit: '1mb',\n  },\n}\n")),(0,r.kt)("p",null,"\u6ce8\u610f\uff0c\u4f7f\u7528 Postman \u505a Post \u8bf7\u6c42\u65f6\u7684\u7c7b\u578b\u9009\u62e9\uff1a"),(0,r.kt)("p",null,(0,r.kt)("img",{parentName:"p",src:"https://img.alicdn.com/imgextra/i4/O1CN01QCdTsN1S347SuzZU5_!!6000000002190-2-tps-1017-690.png",alt:"postman"})),(0,r.kt)("p",null,"\u5173\u95ed bodyParser \u4e2d\u95f4\u4ef6\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  bodyParser: {\n    enable: false,\n    // ...\n  },\n}\n")),(0,r.kt)("h2",{id:"cookie-\u548c-session"},"Cookie \u548c Session"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa")," \u9ed8\u8ba4\u5c01\u88c5\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"cookies")," \u89e3\u6790\u548c ",(0,r.kt)("inlineCode",{parentName:"p"},"Session")," \u7684\u652f\u6301\uff0c\u53ef\u4ee5\u67e5\u770b ",(0,r.kt)("a",{parentName:"p",href:"../cookie_session"},"Cookies \u548c Session"),"\u3002"),(0,r.kt)("h2",{id:"\u6269\u5c55-context"},"\u6269\u5c55 Context"),(0,r.kt)("p",null,"\u5728\u4e00\u4e9b\u573a\u666f\u4e0b\uff0c\u9700\u8981\u5bf9 Context \u505a\u6269\u5c55\u3002"),(0,r.kt)("p",null,"\u5982\u679c\u5e0c\u671b\u6302\u5728\u4e00\u4e9b\u4e34\u65f6\u7684\u8bf7\u6c42\u76f8\u5173\u7684\u5bf9\u8c61\u6570\u636e\uff0c\u53ef\u4ee5\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"ctx.setAttr(key, value)")," API \u6765\u5b9e\u73b0\uff0c\u6bd4\u5982\u7ec4\u4ef6\u91cc\u81ea\u7528\u7684\u6570\u636e\u3002"),(0,r.kt)("p",null,"\u5982\u679c\u5b9e\u5728\u6709\u6269\u5c55 Context \u7684\u8bc9\u6c42\uff0c\u53ef\u4ee5\u4f7f\u7528 koa \u81ea\u5e26\u7684 API\u3002"),(0,r.kt)("p",null,"\u6bd4\u5982\uff0c\u6211\u4eec\u5728 ",(0,r.kt)("inlineCode",{parentName:"p"},"configuration.ts")," \u4e2d\u505a\u6269\u5c55\u63d0\u4f9b\u4e86\u4e00\u4e2a ",(0,r.kt)("inlineCode",{parentName:"p"},"render()")," \u65b9\u6cd5\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { App, Configuration } from '@midwayjs/core';\nimport * as koa from '@midwayjs/koa';\n\n@Configuration({\n    // ...\n})\nexport class MainConfiguration {\n  @App()\n  app: koa.Application;\n\n  async onReady(container) {\n    Object.defineProperties(app.context, {\n      render: {\n        value: async function (...args) {\n          // ...\n        },\n      },\n    });\n  }\n}\n")),(0,r.kt)("p",null,"\u4f46\u662f\u8fd9\u6837\u505a\u65e0\u6cd5\u76f4\u63a5\u8ba9 Context \u5305\u542b Typescript \u5b9a\u4e49\uff0c\u9700\u8981\u989d\u5916\u589e\u52a0\u5b9a\u4e49\uff0c\u8bf7\u53c2\u8003 ",(0,r.kt)("a",{parentName:"p",href:"../context_definition"},"\u6269\u5c55\u4e0a\u4e0b\u6587\u5b9a\u4e49"),"\u3002"),(0,r.kt)("h2",{id:"\u83b7\u53d6-http-server"},"\u83b7\u53d6 Http Server"),(0,r.kt)("p",null,"\u5728\u4e00\u4e9b\u7279\u6b8a\u60c5\u51b5\u4e0b\uff0c\u4f60\u9700\u8981\u83b7\u53d6\u5230\u539f\u59cb\u7684 Http Server\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u670d\u52a1\u5668\u542f\u52a8\u540e\u83b7\u53d6\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { App, Configuration } from '@midwayjs/core';\nimport * as koa from '@midwayjs/koa';\n\n@Configuration({\n    // ...\n})\nexport class MainConfiguration {\n  @Inject()\n  framework: koa.Framework;\n\n  async onServerReady(container) {\n    const server = this.framework.getServer();\n    // ...\n  }\n}\n")),(0,r.kt)("h2",{id:"state-\u7c7b\u578b\u5b9a\u4e49"},"State \u7c7b\u578b\u5b9a\u4e49"),(0,r.kt)("p",null,"\u5728 koa \u7684 Context \u4e2d\u6709\u4e00\u4e2a\u7279\u6b8a\u7684 State \u5c5e\u6027\uff0c\u901a\u8fc7\u548c Context \u7c7b\u4f3c\u7684\u65b9\u5f0f\u53ef\u4ee5\u6269\u5c55 State \u5b9a\u4e49\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/interface.ts\n\ndeclare module '@midwayjs/koa/dist/interface' {\n  interface Context {\n    abc: string;\n  }\n\n  interface State{\n    bbb: string;\n    ccc: number;\n  }\n}\n")),(0,r.kt)("h2",{id:"\u914d\u7f6e"},"\u914d\u7f6e"),(0,r.kt)("h3",{id:"\u9ed8\u8ba4\u914d\u7f6e"},"\u9ed8\u8ba4\u914d\u7f6e"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa")," \u7684\u914d\u7f6e\u6837\u4f8b\u5982\u4e0b\uff1a"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    port: 7001,\n  },\n}\n")),(0,r.kt)("p",null,"\u6240\u6709\u5c5e\u6027\u63cf\u8ff0\u5982\u4e0b\uff1a"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"\u5c5e\u6027"),(0,r.kt)("th",{parentName:"tr",align:null},"\u7c7b\u578b"),(0,r.kt)("th",{parentName:"tr",align:null},"\u63cf\u8ff0"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"port"),(0,r.kt)("td",{parentName:"tr",align:null},"number"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u542f\u52a8\u7684\u7aef\u53e3")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"globalPrefix"),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u5168\u5c40\u7684 http \u524d\u7f00")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"keys"),(0,r.kt)("td",{parentName:"tr",align:null},"string[]"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0cCookies \u7b7e\u540d\uff0c\u5982\u679c\u4e0a\u5c42\u672a\u5199 keys\uff0c\u4e5f\u53ef\u4ee5\u5728\u8fd9\u91cc\u8bbe\u7f6e")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"hostname"),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u76d1\u542c\u7684 hostname\uff0c\u9ed8\u8ba4 127.1")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"key"),(0,r.kt)("td",{parentName:"tr",align:null},"string ","|"," Buffer ","|"," Array<Buffer","|","Object>"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0cHttps key\uff0c\u670d\u52a1\u7aef\u79c1\u94a5")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"cert"),(0,r.kt)("td",{parentName:"tr",align:null},"string ","|"," Buffer ","|"," Array<Buffer","|","Object>"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0cHttps cert\uff0c\u670d\u52a1\u7aef\u8bc1\u4e66")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"ca"),(0,r.kt)("td",{parentName:"tr",align:null},"string ","|"," Buffer ","|"," Array<Buffer","|","Object>"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0cHttps ca")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"http2"),(0,r.kt)("td",{parentName:"tr",align:null},"boolean"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0chttp2 \u652f\u6301\uff0c\u9ed8\u8ba4 false")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"proxy"),(0,r.kt)("td",{parentName:"tr",align:null},"boolean"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u662f\u5426\u5f00\u542f\u4ee3\u7406\uff0c\u5982\u679c\u4e3a true \u5219\u5bf9\u4e8e request \u8bf7\u6c42\u4e2d\u7684 ip \u4f18\u5148\u4ece Header \u5b57\u6bb5\u4e2d X-Forwarded-For \u83b7\u53d6\uff0c\u9ed8\u8ba4 false")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"subdomainOffset"),(0,r.kt)("td",{parentName:"tr",align:null},"number"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u5b50\u57df\u540d\u7684\u504f\u79fb\u91cf\uff0c\u9ed8\u8ba4 2")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"proxyIpHeader"),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u83b7\u53d6\u4ee3\u7406 ip \u7684\u5b57\u6bb5\u540d\uff0c\u9ed8\u8ba4\u4e3a X-Forwarded-For")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"maxIpsCount"),(0,r.kt)("td",{parentName:"tr",align:null},"number"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u83b7\u53d6\u7684 ips \u6700\u5927\u6570\u91cf\uff0c\u9ed8\u8ba4\u4e3a 0\uff08\u5168\u90e8\u8fd4\u56de\uff09")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"serverTimeout"),(0,r.kt)("td",{parentName:"tr",align:null},"number"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0c\u670d\u52a1\u7aef\u8d85\u65f6\u914d\u7f6e\uff0c\u9ed8\u8ba4\u4e3a 2 ",(0,r.kt)("em",{parentName:"td"}," 60 ")," 1000\uff082 \u5206\u949f\uff09\uff0c\u5355\u4f4d\u6beb\u79d2")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"serverOptions"),(0,r.kt)("td",{parentName:"tr",align:null},"Record<string, any>"),(0,r.kt)("td",{parentName:"tr",align:null},"\u53ef\u9009\uff0chttp Server ",(0,r.kt)("a",{parentName:"td",href:"https://nodejs.org/docs/latest/api/http.html#httpcreateserveroptions-requestlistener"},"\u9009\u9879"))))),(0,r.kt)("h3",{id:"\u4fee\u6539\u7aef\u53e3"},"\u4fee\u6539\u7aef\u53e3"),(0,r.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u6211\u4eec\u5728 ",(0,r.kt)("inlineCode",{parentName:"p"},"config.default")," \u63d0\u4f9b\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"7001")," \u7684\u9ed8\u8ba4\u7aef\u53e3\u53c2\u6570\uff0c\u4fee\u6539\u5b83\u5c31\u53ef\u4ee5\u4fee\u6539 koa http \u670d\u52a1\u7684\u9ed8\u8ba4\u7aef\u53e3\u3002"),(0,r.kt)("p",null,"\u6bd4\u5982\u6211\u4eec\u4fee\u6539\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"6001"),"\uff1a"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    port: 6001,\n  },\n}\n")),(0,r.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u5355\u6d4b\u73af\u5883\u7531\u4e8e\u9700\u8981 supertest \u6765\u542f\u52a8\u7aef\u53e3\uff0c\u6211\u4eec\u7684 port \u914d\u7f6e\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.unittest\nexport default {\n  // ...\n  koa: {\n    port: null,\n  },\n}\n")),(0,r.kt)("p",null,"\u6b64\u5916\uff0c\u4e5f\u53ef\u4ee5\u901a\u8fc7 ",(0,r.kt)("inlineCode",{parentName:"p"},"midway-bin dev --ts --port=6001")," \u7684\u65b9\u5f0f\u6765\u4e34\u65f6\u4fee\u6539\u7aef\u53e3\uff0c\u6b64\u65b9\u6cd5\u4f1a\u8986\u76d6\u914d\u7f6e\u4e2d\u7684\u7aef\u53e3\u3002"),(0,r.kt)("h3",{id:"\u5168\u5c40\u524d\u7f00"},"\u5168\u5c40\u524d\u7f00"),(0,r.kt)("p",null,"\u6b64\u529f\u80fd\u8bf7\u53c2\u8003 ",(0,r.kt)("a",{parentName:"p",href:"../controller#%E5%85%A8%E5%B1%80%E8%B7%AF%E7%94%B1%E5%89%8D%E7%BC%80"},"\u5168\u5c40\u524d\u7f00"),"\u3002"),(0,r.kt)("h3",{id:"\u53cd\u5411\u4ee3\u7406\u914d\u7f6e"},"\u53cd\u5411\u4ee3\u7406\u914d\u7f6e"),(0,r.kt)("p",null,"\u5982\u679c\u4f7f\u7528\u4e86 Nginx \u7b49\u53cd\u5411\u4ee3\u7406\uff0c\u8bf7\u5f00\u542f ",(0,r.kt)("inlineCode",{parentName:"p"},"proxy")," \u914d\u7f6e\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    proxy: true,\n  },\n}\n")),(0,r.kt)("p",null,"\u9ed8\u8ba4\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"X-Forwarded-For")," Header\uff0c\u5982\u679c\u4ee3\u7406\u914d\u7f6e\u4e0d\u540c\uff0c\u8bf7\u81ea\u884c\u914d\u7f6e\u4e0d\u540c\u7684 Header\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    proxy: true,\n    proxyIpHeader: 'X-Forwarded-Host'\n  },\n}\n")),(0,r.kt)("h3",{id:"https-\u914d\u7f6e"},"Https \u914d\u7f6e"),(0,r.kt)("p",null,"\u5728\u5927\u591a\u6570\u7684\u60c5\u51b5\uff0c\u8bf7\u5c3d\u53ef\u80fd\u4f7f\u7528\u5916\u90e8\u4ee3\u7406\u7684\u65b9\u5f0f\u6765\u5b8c\u6210 Https \u7684\u5b9e\u73b0\uff0c\u6bd4\u5982 Nginx\u3002"),(0,r.kt)("p",null,"\u5728\u4e00\u4e9b\u7279\u6b8a\u573a\u666f\u4e0b\uff0c\u4f60\u53ef\u4ee5\u901a\u8fc7\u914d\u7f6e SSL \u8bc1\u4e66\uff08TLS \u8bc1\u4e66\uff09\u7684\u65b9\u5f0f\uff0c\u6765\u76f4\u63a5\u5f00\u542f Https\u3002"),(0,r.kt)("p",null,"\u9996\u5148\uff0c\u4f60\u9700\u8981\u63d0\u524d\u51c6\u5907\u597d\u8bc1\u4e66\u6587\u4ef6\uff0c\u6bd4\u5982 ",(0,r.kt)("inlineCode",{parentName:"p"},"ssl.key")," \u548c ",(0,r.kt)("inlineCode",{parentName:"p"},"ssl.pem"),"\uff0ckey \u4e3a\u670d\u52a1\u7aef\u79c1\u94a5\uff0cpem \u4e3a\u5bf9\u5e94\u7684\u8bc1\u4e66\u3002"),(0,r.kt)("p",null,"\u7136\u540e\u914d\u7f6e\u5373\u53ef\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nimport { readFileSync } from 'fs';\nimport { join } from 'path';\n\nexport default {\n  // ...\n  koa: {\n    key: join(__dirname, '../ssl/ssl.key'),\n    cert: join(__dirname, '../ssl/ssl.pem'),\n  },\n}\n")),(0,r.kt)("h3",{id:"favicon-\u8bbe\u7f6e"},"favicon \u8bbe\u7f6e"),(0,r.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u6d4f\u89c8\u5668\u4f1a\u53d1\u8d77\u4e00\u4e2a ",(0,r.kt)("inlineCode",{parentName:"p"},"favicon.ico")," \u7684\u8bf7\u6c42\u3002"),(0,r.kt)("p",null,"\u6846\u67b6\u63d0\u4f9b\u4e86\u4e00\u4e2a\u9ed8\u8ba4\u4e2d\u95f4\u4ef6\uff0c\u7528\u6765\u5904\u7406\u8be5\u8bf7\u6c42\uff0c\u4f60\u53ef\u4ee5\u6307\u5b9a\u4e00\u4e2a ",(0,r.kt)("inlineCode",{parentName:"p"},"favicon")," \u7684 Buffer\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nimport { readFileSync } from 'fs';\nimport { join } from 'path';\n\nexport default {\n  // ...\n  siteFile: {\n    favicon: readFileSync(join(__dirname, '../static/fav.ico')),\n  },\n}\n")),(0,r.kt)("p",null,"\u5982\u679c\u5f00\u542f\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/static-file"),"  \u7ec4\u4ef6\uff0c\u90a3\u4e48\u4f1a\u4f18\u5148\u4f7f\u7528\u7ec4\u4ef6\u7684\u9759\u6001\u6587\u4ef6\u6258\u7ba1\u3002"),(0,r.kt)("p",null,"\u5173\u95ed\u4e2d\u95f4\u4ef6\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  siteFile: {\n    enable: false,\n    // ...\n  },\n}\n")),(0,r.kt)("h3",{id:"\u4fee\u6539\u4e0a\u4e0b\u6587\u65e5\u5fd7"},"\u4fee\u6539\u4e0a\u4e0b\u6587\u65e5\u5fd7"),(0,r.kt)("p",null,"\u53ef\u4ee5\u5355\u72ec\u4fee\u6539 koa \u6846\u67b6\u7684\u4e0a\u4e0b\u6587\u65e5\u5fd7\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"export default {\n  koa: {\n    contextLoggerFormat: info => {\n      const ctx = info.ctx;\n      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;\n    }\n    // ...\n  },\n};\n")),(0,r.kt)("h3",{id:"query-\u6570\u7ec4\u89e3\u6790"},"Query \u6570\u7ec4\u89e3\u6790"),(0,r.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0ckoa \u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"querystring")," \u89e3\u6790 query \u53c2\u6570\uff0c\u5f53\u78b0\u5230\u6570\u7ec4\u65f6\uff0c\u4f1a\u5c06\u6570\u7ec4\u7684\u6570\u636e\u62c6\u5f00\u3002"),(0,r.kt)("p",null,"\u6bd4\u5982\uff1a"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"GET /query?a[0]=1&a[1]=2\n")),(0,r.kt)("p",null,"\u62ff\u5230\u7684\u7ed3\u679c\u662f\uff1a"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "a[0]": 1,\n    "a[1]": 2,\n}\n')),(0,r.kt)("p",null,"\u6846\u67b6\u63d0\u4f9b\u4e86\u4e00\u4e9b\u53c2\u6570\u6765\u5904\u7406\u8fd9\u79cd\u60c5\u51b5\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    queryParseMode: 'extended',\n    // ...\n  },\n}\n")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"queryParseMode")," \u53c2\u6570\u53ef\u4ee5\u9009\u62e9 ",(0,r.kt)("inlineCode",{parentName:"p"},"extended"),"\u3001 ",(0,r.kt)("inlineCode",{parentName:"p"},"strict"),"\u3001",(0,r.kt)("inlineCode",{parentName:"p"},"first")," \u4e09\u79cd\u503c\u3002"),(0,r.kt)("p",null," \u5f53 ",(0,r.kt)("inlineCode",{parentName:"p"},"queryParseMode")," \u6709\u503c\u65f6\uff0c\u4f1a\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"qs")," \u6a21\u5757\u5904\u7406 query\uff0c\u6548\u679c\u540c ",(0,r.kt)("inlineCode",{parentName:"p"},"koa-qs")," \u6a21\u5757\u3002"),(0,r.kt)("p",null,"\u5f53\u8bf7\u6c42\u53c2\u6570\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"/query?a=1&b=2&a=3&c[0]=1&c[1]=2'")," \u65f6\u3002"),(0,r.kt)("p",null,"\u9ed8\u8ba4\u6548\u679c\uff08\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"querystring"),"\uff09"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-JSON"},'{\n  "a": ["1", "3" ],\n  "b": "2",\n  "c[0]": "1",\n  "c[1]": "2"\n}\n')),(0,r.kt)("p",null," ",(0,r.kt)("inlineCode",{parentName:"p"},"extended")," \u6548\u679c"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-JSON"},'{\n  "a": ["1", "3" ],\n  "b": ["2"],\n  "c": ["1", "2"]\n}\n')),(0,r.kt)("p",null," ",(0,r.kt)("inlineCode",{parentName:"p"},"strict")," \u6548\u679c"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-JSON"},'{\n  "a": ["1", "3" ],\n  "b": "2",\n  "c": ["1", "2"]\n}\n')),(0,r.kt)("p",null," ",(0,r.kt)("inlineCode",{parentName:"p"},"first")," \u6548\u679c"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-JSON"},'{\n  "a": "1",\n  "b": "2",\n  "c": "1"\n}\n')),(0,r.kt)("h3",{id:"\u8d85\u65f6\u914d\u7f6e"},"\u8d85\u65f6\u914d\u7f6e"),(0,r.kt)("p",null,"RequestTiemout \u548c ServerTimeout \u662f\u4e24\u79cd\u4e0d\u540c\u7684\u8d85\u65f6\u60c5\u51b5\u3002"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"serverTimeout"),"\uff1a\u7528\u4e8e\u8bbe\u7f6e\u670d\u52a1\u5668\u63a5\u6536\u5230\u8bf7\u6c42\u540e\uff0c\u7b49\u5f85\u5ba2\u6237\u7aef\u53d1\u9001\u6570\u636e\u7684\u8d85\u65f6\u65f6\u95f4\u3002\u5982\u679c\u5728\u8be5\u65f6\u95f4\u5185\u5ba2\u6237\u7aef\u6ca1\u6709\u53d1\u9001\u4efb\u4f55\u6570\u636e\uff0c\u5219\u670d\u52a1\u5668\u5c06\u5173\u95ed\u8fde\u63a5\u3002\u6b64\u8d85\u65f6\u9002\u7528\u4e8e\u6574\u4e2a\u8bf7\u6c42-\u54cd\u5e94\u5468\u671f\uff0c\u5305\u62ec\u8bf7\u6c42\u5934\u3001\u8bf7\u6c42\u4e3b\u4f53\u4ee5\u53ca\u54cd\u5e94\u3002"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"requestTimeout"),"\uff1a\u7528\u4e8e\u8bbe\u7f6e\u670d\u52a1\u5668\u7b49\u5f85\u5ba2\u6237\u7aef\u53d1\u9001\u5b8c\u6574\u8bf7\u6c42\u7684\u8d85\u65f6\u65f6\u95f4\u3002\u8fd9\u4e2a\u8d85\u65f6\u662f\u9488\u5bf9\u8bf7\u6c42\u5934\u548c\u8bf7\u6c42\u4e3b\u4f53\u7684\uff0c\u670d\u52a1\u5668\u5c06\u5728\u8be5\u65f6\u95f4\u5185\u7b49\u5f85\u5ba2\u6237\u7aef\u53d1\u9001\u5b8c\u6574\u7684\u8bf7\u6c42\u3002\u5982\u679c\u5728\u8d85\u65f6\u65f6\u95f4\u5185\u6ca1\u6709\u6536\u5230\u5b8c\u6574\u7684\u8bf7\u6c42\uff0c\u5219\u670d\u52a1\u5668\u5c06\u4e2d\u6b62\u8be5\u8bf7\u6c42\u3002")),(0,r.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c",(0,r.kt)("inlineCode",{parentName:"p"},"serverTimeout")," \u4e3a 0\uff0c\u4e0d\u4f1a\u89e6\u53d1\u8d85\u65f6\u3002"),(0,r.kt)("p",null,"\u5982\u6709\u9700\u6c42\uff0c\u53ef\u4ee5\u901a\u8fc7\u914d\u7f6e\u4fee\u6539\uff0c\u5355\u4f4d\u6beb\u79d2\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    serverTimeout: 100_000\n  },\n}\n")),(0,r.kt)("p",null,"\u5982\u679c\u7a0b\u5e8f\u51fa\u73b0 ",(0,r.kt)("inlineCode",{parentName:"p"},"ERR_HTTP_REQUEST_TIMEOUT")," \u8fd9\u4e2a\u9519\u8bef\uff0c\u8bf4\u660e\u662f\u89e6\u53d1\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"requestTimeout"),"\uff0c\u9ed8\u8ba4\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"300_000")," \uff08\u4e94\u5206\u949f\uff09\uff0c\u5355\u4f4d\u6beb\u79d2\uff0c\u53ef\u4ee5\u901a\u8fc7\u4ee5\u4e0b\u914d\u7f6e\u4fee\u6539\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    serverOptions: {\n      requestTimeout: 600_000\n    }\n  },\n}\n")))}u.isMDXComponent=!0}}]);