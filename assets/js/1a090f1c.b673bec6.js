"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[81224],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=s(r),f=a,d=u["".concat(p,".").concat(f)]||u[f]||m[f]||l;return r?n.createElement(d,o(o({ref:t},c),{},{components:r})):n.createElement(d,o({ref:t},c))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,o=new Array(l);o[0]=f;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[u]="string"==typeof e?e:a,o[1]=i;for(var s=2;s<l;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},54081:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>m,frontMatter:()=>l,metadata:()=>i,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const l={slug:"release/3.18.0",title:"Release 3.18.0",authors:["harry"],tags:["release"]},o=void 0,i={permalink:"/blog/release/3.18.0",source:"@site/blog/2024-09-22-release-3.18.md",title:"Release 3.18.0",description:"\u5347\u7ea7\u8bf7\u53c2\u8003  \u5982\u4f55\u66f4\u65b0 Midway \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002",date:"2024-09-22T00:00:00.000Z",formattedDate:"2024\u5e749\u670822\u65e5",tags:[{label:"release",permalink:"/blog/tags/release"}],readingTime:1.83,hasTruncateMarker:!1,authors:[{name:"Harry Chen",title:"Maintainer of Midway",url:"https://github.com/czy88840616",imageURL:"https://avatars.githubusercontent.com/u/418820",key:"harry"}],frontMatter:{slug:"release/3.18.0",title:"Release 3.18.0",authors:["harry"],tags:["release"]},nextItem:{title:"Release 3.17.0",permalink:"/blog/release/3.17.0"}},p={authorsImageUrls:[void 0]},s=[{value:"\u5f02\u6b65\u8fed\u4ee3\u5668\u4e0a\u4f20\u6a21\u5f0f",id:"\u5f02\u6b65\u8fed\u4ee3\u5668\u4e0a\u4f20\u6a21\u5f0f",level:2},{value:"\u6b64\u5916\u8fd8\u6709\u66f4\u591a\u7684\u53d8\u5316",id:"\u6b64\u5916\u8fd8\u6709\u66f4\u591a\u7684\u53d8\u5316",level:2}],c={toc:s},u="wrapper";function m(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"\u5347\u7ea7\u8bf7\u53c2\u8003  ",(0,a.kt)("a",{parentName:"p",href:"/docs/how_to_update_midway"},"\u5982\u4f55\u66f4\u65b0 Midway")," \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002"),(0,a.kt)("p",null,"\u672c\u6b21 3.18 \u7248\u672c\uff0c\u4e3b\u8981\u4fee\u590d\u4e86\u65b0\u7684 busboy \u7ec4\u4ef6\u7684\u4e00\u4e9b\u9057\u7559\u95ee\u9898\uff0c\u4ee5\u53ca\u65b0\u589e\u4e86\u4e00\u79cd\u4e0a\u4f20\u6a21\u5f0f\u3002"),(0,a.kt)("p",null,"\u4e0b\u9762\u662f\u66f4\u4e3a\u7ec6\u8282\u7684\u63cf\u8ff0\u3002"),(0,a.kt)("h2",{id:"\u5f02\u6b65\u8fed\u4ee3\u5668\u4e0a\u4f20\u6a21\u5f0f"},"\u5f02\u6b65\u8fed\u4ee3\u5668\u4e0a\u4f20\u6a21\u5f0f"),(0,a.kt)("p",null,"\u4e3a\u4e86\u652f\u6301\u5355\u6b21\u591a\u4e2a\u6587\u4ef6\u7684\u6d41\u5f0f\u4e0a\u4f20\uff0c\u65b0\u7248\u672c\u4f7f\u7528\u4e86\u5f02\u6b65\u8fed\u4ee3\u5668\u6a21\u578b\u8f6c\u6362\u4e86\u4e0a\u4f20\u6d41\uff0c\u8fd9\u4e2a\u65b0\u7684\u6a21\u5f0f\u7528\u4e8e\u66ff\u4ee3\u539f\u6709\u7684\u6d41\u5f0f\u6a21\u5f0f\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nexport default {\n  // ...\n  busboy: {\n    mode: 'asyncIterator',\n  },\n}\n")),(0,a.kt)("p",null,"\u88c5\u9970\u5668\u7684\u5165\u53c2\u4e5f\u5df2\u7ecf\u53d8\u6210\u4e86\u5f02\u6b65\u8fed\u4ee3\u5668\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Controller, Post, Files, Fields } from '@midwayjs/core';\nimport { UploadStreamFileInfo, UploadStreamFieldInfo } from '@midwayjs/busboy';\n\n@Controller('/')\nexport class HomeController {\n\n  @Post('/upload', /*...*/)\n  async upload(\n    @Files() fileIterator: AsyncGenerator<UploadStreamFileInfo>,\n    @Fields() fieldIterator: AsyncGenerator<UploadStreamFieldInfo>\n  ) {\n    // ...\n  }\n}\n")),(0,a.kt)("p",null,"\u6211\u4eec\u53ef\u4ee5\u901a\u8fc7\u5faa\u73af\u8fed\u4ee3\u5668\u83b7\u53d6\u5230\u6bcf\u4e2a\u4e0a\u4f20\u7684\u6587\u4ef6\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"for await (const file of fileIterator) {\n  const { filename, data } = file;\n  // ...\n}\n")),(0,a.kt)("p",null,"\u8fdb\u800c\u53ef\u4ee5\u65b9\u4fbf\u7684\u505a\u540e\u7eed\u5904\u7406\u3002"),(0,a.kt)("p",null,"\u66f4\u591a\u7684\u5185\u5bb9\uff0c\u8bf7\u53c2\u8003 ",(0,a.kt)("a",{parentName:"p",href:"/docs/extensions/busboy"},"\u7ec6\u8282\u6587\u6863"),"\u3002"),(0,a.kt)("h2",{id:"\u6b64\u5916\u8fd8\u6709\u66f4\u591a\u7684\u53d8\u5316"},"\u6b64\u5916\u8fd8\u6709\u66f4\u591a\u7684\u53d8\u5316"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u6d41\u5f0f\u4e0a\u4f20\u65f6\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"fieldName")," \u5b57\u6bb5\u73b0\u5728\u6062\u590d\u4e86"),(0,a.kt)("li",{parentName:"ul"},"httpClient \u73b0\u5728\u9ed8\u8ba4\u7684\u914d\u7f6e\u4e0d\u518d\u4f1a\u88ab\u5355\u6b21\u8bf7\u6c42\u8986\u76d6"),(0,a.kt)("li",{parentName:"ul"},"\u6570\u636e\u6e90\u7684\u4f18\u5148\u7ea7 NPE \u62a5\u9519\u73b0\u5728\u5df2\u7ecf\u4fee\u590d\u4e86"),(0,a.kt)("li",{parentName:"ul"},"\u4e1a\u52a1\u4e2d\u7684 https \u914d\u7f6e\u73b0\u5728\u5728 dev \u7684\u8f93\u51fa\u63d0\u793a\u4e2d\u4e5f\u53d8\u5f97\u6b63\u5e38\u4e86")),(0,a.kt)("p",null,"\u4ee5\u53ca\u4e00\u5927\u6279\u4f9d\u8d56\u8fdb\u884c\u4e86\u66f4\u65b0\uff0c\u53ef\u4ee5\u53c2\u8003\u6211\u4eec\u7684 ",(0,a.kt)("a",{parentName:"p",href:"https://midwayjs.org/changelog/v3.18.0"},"ChangeLog"),"\u3002"))}m.isMDXComponent=!0}}]);