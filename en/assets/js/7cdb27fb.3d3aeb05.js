"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[58704],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),i=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=i(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),c=i(n),d=a,k=c["".concat(s,".").concat(d)]||c[d]||m[d]||l;return n?r.createElement(k,o(o({ref:t},u),{},{components:n})):r.createElement(k,o({ref:t},u))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,o=new Array(l);o[0]=d;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[c]="string"==typeof e?e:a,o[1]=p;for(var i=2;i<l;i++)o[i]=n[i];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},18826:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>m,frontMatter:()=>l,metadata:()=>p,toc:()=>i});var r=n(87462),a=(n(67294),n(3905));const l={slug:"release/3.17.0",title:"Release 3.17.0",authors:["harry"],tags:["release"]},o=void 0,p={permalink:"/en/blog/release/3.17.0",source:"@site/blog/2024-08-29-release-3.17.md",title:"Release 3.17.0",description:"\u5347\u7ea7\u8bf7\u53c2\u8003  \u5982\u4f55\u66f4\u65b0 Midway \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002",date:"2024-08-29T00:00:00.000Z",formattedDate:"August 29, 2024",tags:[{label:"release",permalink:"/en/blog/tags/release"}],readingTime:3.3,hasTruncateMarker:!1,authors:[{name:"Harry Chen",title:"Maintainer of Midway",url:"https://github.com/czy88840616",imageURL:"https://avatars.githubusercontent.com/u/418820",key:"harry"}],frontMatter:{slug:"release/3.17.0",title:"Release 3.17.0",authors:["harry"],tags:["release"]},nextItem:{title:"mwtsc \u589e\u52a0\u7248\u672c\u68c0\u67e5",permalink:"/en/blog/mwtsc-check"}},s={authorsImageUrls:[void 0]},i=[{value:"\u5b9a\u5236\u670d\u52a1\u7aef\u54cd\u5e94\u683c\u5f0f",id:"\u5b9a\u5236\u670d\u52a1\u7aef\u54cd\u5e94\u683c\u5f0f",level:2},{value:"\u4e0a\u4f20\u7ec4\u4ef6",id:"\u4e0a\u4f20\u7ec4\u4ef6",level:2},{value:"\u66f4\u591a\u7684\u53d8\u5316",id:"\u66f4\u591a\u7684\u53d8\u5316",level:2}],u={toc:i},c="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"\u5347\u7ea7\u8bf7\u53c2\u8003  ",(0,a.kt)("a",{parentName:"p",href:"/docs/how_to_update_midway"},"\u5982\u4f55\u66f4\u65b0 Midway")," \u4e2d\u63cf\u8ff0\uff0c\u8bf7\u4e0d\u8981\u5355\u72ec\u5347\u7ea7\u67d0\u4e2a\u7ec4\u4ef6\u5305\u3002"),(0,a.kt)("p",null,"\u672c\u6b21 3.17 \u7248\u672c\uff0c\u6211\u4eec\u589e\u52a0\u4e86\u4e00\u4e9b\u65b0\u7684\u7279\u6027\uff0c\u4ee5\u53ca\u4fee\u590d\u4e86\u4e00\u4e9b\u95ee\u9898\uff0c\u4e3b\u8981\u6709\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"1\u3001\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"li"},"busboy")," \u66ff\u6362\u539f\u6709\u7684\u4e0a\u4f20\u7ec4\u4ef6"),(0,a.kt)("li",{parentName:"ul"},"2\u3001\u589e\u52a0\u4e86\u4e00\u4e2a\u65b0\u7684\u670d\u52a1\u7aef\u54cd\u5e94\u683c\u5f0f"),(0,a.kt)("li",{parentName:"ul"},"3\u3001class \u4e2d\u95f4\u4ef6\u73b0\u5728\u53ef\u4ee5\u590d\u7528\u4e86")),(0,a.kt)("p",null,"\u4e0b\u9762\u662f\u66f4\u4e3a\u7ec6\u8282\u7684\u63cf\u8ff0\u3002"),(0,a.kt)("h2",{id:"\u5b9a\u5236\u670d\u52a1\u7aef\u54cd\u5e94\u683c\u5f0f"},"\u5b9a\u5236\u670d\u52a1\u7aef\u54cd\u5e94\u683c\u5f0f"),(0,a.kt)("p",null,"\u5728 3.17 \u7248\u672c\u4e2d\uff0c\u6211\u4eec\u589e\u52a0\u4e86\u4e00\u4e2a\u65b0\u7684\u7279\u6027\uff0c\u53ef\u4ee5\u5b9a\u5236\u670d\u52a1\u7aef\u7684\u54cd\u5e94\u7684\u901a\u7528\u683c\u5f0f\u3002"),(0,a.kt)("p",null,"\u5728\u4e4b\u524d\u7684\u7248\u672c\u4e2d\uff0c\u6211\u4eec\u4f9d\u9760\u4e2d\u95f4\u4ef6\u548c\u8fc7\u6ee4\u5668\u6765\u5b9e\u73b0\u8fd9\u4e2a\u529f\u80fd\uff0c\u4f46\u662f\u8fd9\u79cd\u65b9\u5f0f\u6709\u4e00\u4e9b\u5c40\u9650\u6027\uff0c\u4ee3\u7801\u4e5f\u4f1a\u5206\u6563\u5728\u4e0d\u540c\u7684\u5730\u65b9\u3002"),(0,a.kt)("p",null,"\u5982\u679c\u7531\u4e00\u4e2a\u7edf\u4e00\u7684\u53ef\u8c03\u6574\u7684\u8fd4\u56de\u903b\u8f91\uff0c\u53ef\u80fd\u66f4\u4e3a\u5408\u7406\uff0c\u4e3a\u6b64\uff0c\u6dfb\u52a0\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"ServerResponse")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"HttpServerResponse")," \u7684\u5b9e\u73b0\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { ServerResponse, HttpServerResponse } from '@midwayjs/core';\n\n@Controller()\nexport class HomeController {\n  @Inject()\n  ctx: Context;\n\n  @Get('/')\n  async index() {\n    return new HttpServerResponse(this.ctx).json({\n      success: true,\n      data: 'hello world',\n    });\n  }\n}\n")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"HttpServerResponse")," \u662f ",(0,a.kt)("inlineCode",{parentName:"p"},"ServerResponse")," \u7684\u4e00\u4e2a Http \u5b9e\u73b0\uff0c\u63d0\u4f9b\u4e86\u4e00\u4e9b\u5e38\u7528\u7684\u65b9\u6cd5\u3002"),(0,a.kt)("p",null,"\u6700\u4e3a\u7279\u6b8a\u7684\u662f\u4ed6\u53ef\u4ee5\u9488\u5bf9\u4e0d\u540c\u7684\u6570\u636e\u683c\u5f0f\uff0c\u8bbe\u7f6e\u6210\u529f\u548c\u5931\u8d25\u7684\u6a21\u7248\u3002"),(0,a.kt)("p",null,"\u6bd4\u5982\u9488\u5bf9 JSON \u6570\u636e\uff0c\u6846\u67b6\u63d0\u4f9b\u4e86\u4ee5\u4e0b\u7684\u9ed8\u8ba4\u7ed3\u6784\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"HttpServerResponse.JSON_TPL = (data, isSuccess) => {\n  if (isSuccess) {\n    return {\n      success: 'true',\n      data,\n    };\n  } else {\n    return {\n      success: 'false',\n      message: data || 'fail',\n    };\n  }\n};\n")),(0,a.kt)("p",null,"\u8fd9\u6837\uff0c\u5f53\u8fd4\u56de JSON \u683c\u5f0f\u65f6\uff0c\u5c31\u4f1a\u6309\u7167\u8fd9\u4e2a\u6a21\u7248\u8fdb\u884c\u8fd4\u56de\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"// \u5931\u8d25\u7684\u8fd4\u56de\nreturn new HttpServerResponse(this.ctx).fail().json('hello world');\n")),(0,a.kt)("p",null,"\u5c31\u4f1a\u83b7\u53d6\u5230\u4ee5\u4e0b\u7684\u6570\u636e\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"{\n  success: 'false',\n  message: 'hello world',\n}\n")),(0,a.kt)("p",null,"\u6b64\u5916\uff0c\u57fa\u4e8e\u8fd9\u4e2a\u6a21\u5f0f\uff0c\u4e5f\u540c\u65f6\u5b9e\u73b0\u4e86 SSE \u7684\u54cd\u5e94\u8fd4\u56de\uff0c\u4e5f\u6709\u5176\u4ed6\u7684\u4e00\u4e9b\u6570\u636e\u7ed3\u6784\u7684\u8fd4\u56de\uff0c\u66f4\u591a\u7684\u5185\u5bb9\uff0c\u8bf7\u53c2\u8003 ",(0,a.kt)("a",{parentName:"p",href:"/docs/data_response"},"\u7ec6\u8282\u6587\u6863"),"\u3002"),(0,a.kt)("h2",{id:"\u4e0a\u4f20\u7ec4\u4ef6"},"\u4e0a\u4f20\u7ec4\u4ef6"),(0,a.kt)("p",null,"\u7531\u4e8e\u5728\u5c0f\u6587\u4ef6\u573a\u666f\u4e0b\u4e0a\u4f20\u78b0\u5230\u4e00\u4e9b\u95ee\u9898\uff0c\u4ece v3.17 \u5f00\u59cb\uff0c\u57fa\u4e8e ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/mscdex/busboy"},"busboy")," \u5b9e\u73b0\u4e86\u4e00\u4e2a\u65b0\u7684\u4e0a\u4f20\u7ec4\u4ef6\uff0c\u66ff\u6362\u539f\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload"),"\u3002"),(0,a.kt)("p",null,"\u548c\u539f\u6709\u7684\u7ec4\u4ef6\u6bd4\u6709\u4e00\u4e9b\u4e0d\u540c\u3002"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"1\u3001\u4e0d\u518d\u9ed8\u8ba4\u52a0\u8f7d\u4e2d\u95f4\u4ef6\uff0c\u56e0\u4e3a\u4e0a\u4f20\u53ea\u662f\u5c11\u90e8\u5206\u63a5\u53e3\u7684\u7279\u6b8a\u903b\u8f91\uff0c\u4e0d\u9700\u8981\u5168\u5c40\u52a0\u8f7d"),(0,a.kt)("li",{parentName:"ul"},"2\u3001\u914d\u7f6e\u7684 key \u4e3a\u4e86\u907f\u514d\u51b2\u7a81\uff0c\u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"upload")," \u53d8\u4e3a ",(0,a.kt)("inlineCode",{parentName:"li"},"busboy")),(0,a.kt)("li",{parentName:"ul"},"3\u3001\u539f\u6709\u4e0a\u4f20\u7684\u6570\u636e\u4e2d\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"filedName"),"\uff0c\u5728\u6d41\u5f0f\u6a21\u5f0f\u4e0b\u4e0d\u518d\u63d0\u4f9b")),(0,a.kt)("p",null,"\u5176\u4f59\u7684\u4f7f\u7528\u65b9\u5f0f\u548c\u539f\u6709\u7684\u4e0a\u4f20\u7ec4\u4ef6\u4e00\u81f4\uff0c"),(0,a.kt)("p",null,"\u66f4\u591a\u7ec6\u8282\u8bf7\u8bbf\u95ee ",(0,a.kt)("a",{parentName:"p",href:"/docs/extensions/busboy"},"\u6587\u6863"),"\u3002"),(0,a.kt)("h2",{id:"\u66f4\u591a\u7684\u53d8\u5316"},"\u66f4\u591a\u7684\u53d8\u5316"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u4fee\u590d\u4e86\u4e00\u4e2a\u591a\u8bed\u8a00\u5339\u914d key \u7684\u95ee\u9898"),(0,a.kt)("li",{parentName:"ul"},"\u4e00\u4e9b\u4e0d\u5408\u7406\u7c7b\u578b\u5b9a\u4e49\u7684\u8c03\u6574")),(0,a.kt)("p",null,"\u4ee5\u53ca\u4e00\u5927\u6279\u4f9d\u8d56\u8fdb\u884c\u4e86\u66f4\u65b0\uff0c\u53ef\u4ee5\u53c2\u8003\u6211\u4eec\u7684 ",(0,a.kt)("a",{parentName:"p",href:"https://midwayjs.org/changelog/v3.17.0"},"ChangeLog"),"\u3002"))}m.isMDXComponent=!0}}]);