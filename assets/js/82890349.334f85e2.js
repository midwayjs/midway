"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[99793],{3905:(e,t,n)=>{n.d(t,{Zo:()=>i,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},i=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,i=c(e,["components","mdxType","originalType","parentName"]),u=s(n),k=a,f=u["".concat(p,".").concat(k)]||u[k]||m[k]||o;return n?r.createElement(f,l(l({ref:t},i),{},{components:n})):r.createElement(f,l({ref:t},i))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=k;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[u]="string"==typeof e?e:a,l[1]=c;for(var s=2;s<o;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},52643:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=n(87462),a=(n(67294),n(3905));const o={slug:"release/3.19.0",title:"Release 3.19.0",authors:["harry"],tags:["release"]},l=void 0,c={permalink:"/blog/release/3.19.0",source:"@site/blog/2024-11-08-release-3.19.md",title:"Release 3.19.0",description:"\u5347\u7ea7\u8bf7\u53c2\u8003 \u5982\u4f55\u66f4\u65b0 Midway \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002",date:"2024-11-08T00:00:00.000Z",formattedDate:"2024\u5e7411\u67088\u65e5",tags:[{label:"release",permalink:"/blog/tags/release"}],readingTime:2.47,hasTruncateMarker:!1,authors:[{name:"Harry Chen",title:"Maintainer of Midway",url:"https://github.com/czy88840616",imageURL:"https://avatars.githubusercontent.com/u/418820",key:"harry"}],frontMatter:{slug:"release/3.19.0",title:"Release 3.19.0",authors:["harry"],tags:["release"]},nextItem:{title:"Release 3.18.0",permalink:"/blog/release/3.18.0"}},p={authorsImageUrls:[void 0]},s=[{value:"Kafka \u7ec4\u4ef6\u91cd\u6784",id:"kafka-\u7ec4\u4ef6\u91cd\u6784",level:2},{value:"Mock \u529f\u80fd\u5206\u7ec4",id:"mock-\u529f\u80fd\u5206\u7ec4",level:2},{value:"\u65b0\u589e\u4e86\u4e00\u4e2a\u542f\u52a8\u6027\u80fd\u5206\u6790\u7684\u547d\u4ee4",id:"\u65b0\u589e\u4e86\u4e00\u4e2a\u542f\u52a8\u6027\u80fd\u5206\u6790\u7684\u547d\u4ee4",level:2},{value:"\u5176\u4ed6\u66f4\u65b0",id:"\u5176\u4ed6\u66f4\u65b0",level:2}],i={toc:s},u="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},i,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"\u5347\u7ea7\u8bf7\u53c2\u8003 ",(0,a.kt)("a",{parentName:"p",href:"/docs/how_to_update_midway"},"\u5982\u4f55\u66f4\u65b0 Midway")," \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002"),(0,a.kt)("p",null,"\u672c\u6b21 3.19 \u7248\u672c\uff0c\u4e3b\u8981\u5f15\u5165\u4e86 Kafka \u7ec4\u4ef6\u7684\u91cd\u6784\uff0c\u4ee5\u53ca\u4e00\u4e9b\u6027\u80fd\u4f18\u5316\u548c bug \u4fee\u590d\u3002"),(0,a.kt)("p",null,"\u4e0b\u9762\u662f\u66f4\u4e3a\u7ec6\u8282\u7684\u63cf\u8ff0\u3002"),(0,a.kt)("h2",{id:"kafka-\u7ec4\u4ef6\u91cd\u6784"},"Kafka \u7ec4\u4ef6\u91cd\u6784"),(0,a.kt)("p",null,"\u4ece v3.19 \u5f00\u59cb\uff0cKafka \u7ec4\u4ef6\u8fdb\u884c\u4e86\u91cd\u6784\uff0c\u914d\u7f6e\u548c\u4f7f\u7528\u65b9\u6cd5\u4e0e\u4e4b\u524d\u6709\u8f83\u5927\u5dee\u5f02\u3002\u867d\u7136\u539f\u6709\u7684\u4f7f\u7528\u65b9\u5f0f\u4ecd\u7136\u517c\u5bb9\uff0c\u4f46\u6587\u6863\u4e0d\u518d\u4fdd\u7559\u3002\u65b0\u7684 Kafka \u7ec4\u4ef6\u63d0\u4f9b\u4e86\u66f4\u7075\u6d3b\u7684\u914d\u7f6e\u548c\u66f4\u5f3a\u5927\u7684\u529f\u80fd\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nexport default {\n  kafka: {\n    consumer: {\n      sub1: {\n        connectionOptions: {\n          clientId: 'my-app',\n          brokers: ['localhost:9092'],\n        },\n        consumerOptions: {\n          groupId: 'groupId-test-1',\n        },\n        subscribeOptions: {\n          topics: ['topic-test-1'],\n        }\n      },\n    },\n    producer: {\n      clients: {\n        pub1: {\n          connectionOptions: {\n            clientId: 'my-app',\n            brokers: ['localhost:9092'],\n          },\n          producerOptions: {\n            // ...\n          }\n        }\n      }\n    }\n  }\n}\n")),(0,a.kt)("p",null,"\u66f4\u591a\u7684\u5185\u5bb9\uff0c\u8bf7\u53c2\u8003 ",(0,a.kt)("a",{parentName:"p",href:"/docs/extensions/kafka"},"Kafka \u7ec4\u4ef6\u6587\u6863"),"\u3002"),(0,a.kt)("h2",{id:"mock-\u529f\u80fd\u5206\u7ec4"},"Mock \u529f\u80fd\u5206\u7ec4"),(0,a.kt)("p",null,"\u4ece ",(0,a.kt)("inlineCode",{parentName:"p"},"3.19.0")," \u5f00\u59cb\uff0cMidway \u7684 mock \u529f\u80fd\u652f\u6301\u901a\u8fc7\u5206\u7ec4\u6765\u7ba1\u7406\u4e0d\u540c\u7684 mock \u6570\u636e\u3002\u4f60\u53ef\u4ee5\u5728\u521b\u5efa mock \u65f6\u6307\u5b9a\u4e00\u4e2a\u5206\u7ec4\u540d\u79f0\uff0c\u8fd9\u6837\u53ef\u4ee5\u5728\u9700\u8981\u65f6\u5355\u72ec\u6062\u590d\u6216\u6e05\u7406\u67d0\u4e2a\u5206\u7ec4\u7684 mock \u6570\u636e\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { mockContext, restoreMocks } from '@midwayjs/mock';\n\nit('should test mock with groups', async () => {\n  const app = await createApp();\n\n  // \u521b\u5efa\u666e\u901a\u5bf9\u8c61\u7684 mock\n  const a = {};\n  mockProperty(a, 'getUser', async () => {\n    return 'midway';\n  }, 'group1');\n\n  // \u521b\u5efa\u4e0a\u4e0b\u6587\u7684 mock\n  mockContext(app, 'user', 'midway', 'group1');\n  mockContext(app, 'role', 'admin', 'group2');\n\n  // \u6062\u590d\u5355\u4e2a\u5206\u7ec4\n  restoreMocks('group1');\n\n  // \u6062\u590d\u6240\u6709\u5206\u7ec4\n  restoreAllMocks();\n});\n")),(0,a.kt)("p",null,"\u901a\u8fc7\u5206\u7ec4\uff0c\u4f60\u53ef\u4ee5\u66f4\u7075\u6d3b\u5730\u7ba1\u7406\u548c\u63a7\u5236 mock \u6570\u636e\uff0c\u7279\u522b\u662f\u5728\u590d\u6742\u7684\u6d4b\u8bd5\u573a\u666f\u4e2d\u3002"),(0,a.kt)("h2",{id:"\u65b0\u589e\u4e86\u4e00\u4e2a\u542f\u52a8\u6027\u80fd\u5206\u6790\u7684\u547d\u4ee4"},"\u65b0\u589e\u4e86\u4e00\u4e2a\u542f\u52a8\u6027\u80fd\u5206\u6790\u7684\u547d\u4ee4"),(0,a.kt)("p",null,"\u5728\u5f00\u53d1\u73af\u5883\u4e0b\uff0c\u65b0\u589e\u4e86\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"perf-init")," \u547d\u4ee4\uff0c\u7528\u4e8e\u5728\u542f\u52a8\u65f6\u521d\u59cb\u5316\u6027\u80fd\u5206\u6790\uff0c\u9700\u8981\u914d\u5408\u6700\u65b0\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"mwtsc")," \u4e00\u540c\u4f7f\u7528\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "scripts": {\n    "dev": "cross-env NODE_ENV=local mwtsc --watch --run @midwayjs/mock/app.js --perf-init"\n  }\n}\n')),(0,a.kt)("h2",{id:"\u5176\u4ed6\u66f4\u65b0"},"\u5176\u4ed6\u66f4\u65b0"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u66f4\u65b0\u4e86\u4e00\u4e9b\u4f9d\u8d56\u5e93\u4ee5\u63d0\u9ad8\u5b89\u5168\u6027\u548c\u7a33\u5b9a\u6027\u3002")),(0,a.kt)("p",null,"\u66f4\u591a\u7684\u66f4\u65b0\u5185\u5bb9\u548c\u8be6\u7ec6\u4fe1\u606f\uff0c\u8bf7\u53c2\u8003\u6211\u4eec\u7684 ",(0,a.kt)("a",{parentName:"p",href:"https://midwayjs.org/changelog/v3.19.0"},"ChangeLog"),"\u3002"))}m.isMDXComponent=!0}}]);