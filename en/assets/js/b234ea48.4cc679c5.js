"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[76258],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>d});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},s="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},y=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),s=p(n),y=a,d=s["".concat(c,".").concat(y)]||s[y]||u[y]||i;return n?r.createElement(d,o(o({ref:t},m),{},{components:n})):r.createElement(d,o({ref:t},m))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=y;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[s]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}y.displayName="MDXCreateElement"},68862:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={slug:"mwtsc-check",title:"mwtsc \u589e\u52a0\u7248\u672c\u68c0\u67e5",authors:["harry"],tags:["mwtsc"]},o=void 0,l={permalink:"/en/blog/mwtsc-check",source:"@site/blog/2024-07-12-mwtsc-check.md",title:"mwtsc \u589e\u52a0\u7248\u672c\u68c0\u67e5",description:"\u7531\u4e8e Midway \u7248\u672c\u53d1\u5e03\u89c4\u5219\uff0c@midwayjs/core \u548c\u7ec4\u4ef6\u6709\u7740\u7248\u672c\u5bf9\u5e94\u5173\u7cfb\uff0c\u5373\u4f4e\u7248\u672c\u7684 @midwayjs/core \u65e0\u6cd5\u4f7f\u7528\u9ad8\u7248\u672c\u7684\u7ec4\u4ef6\u3002",date:"2024-07-12T00:00:00.000Z",formattedDate:"July 12, 2024",tags:[{label:"mwtsc",permalink:"/en/blog/tags/mwtsc"}],readingTime:1.705,hasTruncateMarker:!1,authors:[{name:"Harry Chen",title:"Maintainer of Midway",url:"https://github.com/czy88840616",imageURL:"https://avatars.githubusercontent.com/u/418820",key:"harry"}],frontMatter:{slug:"mwtsc-check",title:"mwtsc \u589e\u52a0\u7248\u672c\u68c0\u67e5",authors:["harry"],tags:["mwtsc"]},nextItem:{title:"Release 3.16.0",permalink:"/en/blog/release/3.16.0"}},c={authorsImageUrls:[void 0]},p=[],m={toc:p},s="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(s,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"\u7531\u4e8e Midway \u7248\u672c\u53d1\u5e03\u89c4\u5219\uff0c",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/core")," \u548c\u7ec4\u4ef6\u6709\u7740\u7248\u672c\u5bf9\u5e94\u5173\u7cfb\uff0c\u5373\u4f4e\u7248\u672c\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/core")," \u65e0\u6cd5\u4f7f\u7528\u9ad8\u7248\u672c\u7684\u7ec4\u4ef6\u3002"),(0,a.kt)("p",null,"\u6bd4\u5982 ",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/axios@3.17.0")," \u53ef\u80fd\u4f7f\u7528\u4e86\u9ad8\u7248\u672c\u7684 API\uff0c\u662f\u65e0\u6cd5\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/core@3.16.0")," \u7248\u672c\u4e0a\u6267\u884c\u7684\u3002"),(0,a.kt)("p",null,"\u7531\u4e8e npm \u7b49\u5305\u7ba1\u7406\u7684\u7279\u6027\uff0c\u5305\u5b89\u88c5\u65f6\u4e0d\u5b58\u5728\u8054\u7cfb\uff0c",(0,a.kt)("inlineCode",{parentName:"p"},"npm i @midwayjs/axios")," \u65f6\u5f80\u5f80\u53ea\u4f1a\u5b89\u88c5\u7ec4\u4ef6\u6700\u65b0\u7684\u7248\u672c\uff0c\u975e\u5e38\u5bb9\u6613\u9020\u6210\u517c\u5bb9\u6027\u95ee\u9898\u3002"),(0,a.kt)("p",null,"\u4e3a\u6b64\u6211\u4eec\u63d0\u4f9b\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"npx midway-version")," \u547d\u4ee4\uff0c\u53ef\u4ee5\u5feb\u901f\u68c0\u67e5\u7248\u672c\u4e4b\u95f4\u7684\u517c\u5bb9\u6027\u9519\u8bef\u3002"),(0,a.kt)("p",null,"\u5728\u63a8\u884c\u4e00\u9635\u5b50\u4e4b\u540e\uff0c\u6211\u4eec\u53d1\u73b0\u5f88\u5c11\u6709\u7528\u6237\u4e3b\u52a8\u53bb\u6267\u884c\u8fd9\u6837\u7684\u6307\u4ee4\uff0c\u53ea\u4f1a\u5728\u51fa\u9519\u65f6\u88ab\u52a8\u6267\u884c\uff0c\u518d\u52a0\u4e0a\u9501\u5305\u548c\u4e0d\u9501\u5305\u7684\u590d\u6742\u573a\u666f\uff0c\u4f1a\u51fa\u73b0\u4e00\u4e9b\u5f88\u96be\u590d\u73b0\u548c\u6392\u67e5\u7684\u73b0\u8c61\u3002"),(0,a.kt)("p",null,"\u4e3a\u4e86\u964d\u4f4e\u590d\u6742\u6027\uff0c\u5728 mwtsc \u65b0\u7248\u672c\u7684\u542f\u52a8\u9636\u6bb5\uff0c\u6211\u4eec\u4e5f\u52a0\u5165\u4e86\u68c0\u67e5\u4ee3\u7801\u3002"),(0,a.kt)("p",null,(0,a.kt)("img",{parentName:"p",src:"https://img.alicdn.com/imgextra/i3/O1CN01ZHQcs51tDb5HrSviC_!!6000000005868-2-tps-1550-420.png",alt:null})),(0,a.kt)("p",null,"\u5982\u679c\u51fa\u73b0\u4e0d\u517c\u5bb9\u7684\u7248\u672c\uff0c\u5de5\u5177\u4f1a\u8fdb\u884c\u63d0\u793a\u3002"),(0,a.kt)("p",null,"\u6b64\u5916\uff0c\u65b0\u589e\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"npx midway-version -m")," \u6307\u4ee4\u53ef\u4ee5\u8ba9\u56fa\u5316\u7248\u672c\u7684\u7528\u6237\u4e5f\u4eab\u53d7\u5230\u66f4\u65b0\u5de5\u5177\u3002"),(0,a.kt)("p",null,"\u548c\u4e4b\u524d\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"-u")," \u6307\u4ee4\u4e0d\u540c\uff0c",(0,a.kt)("inlineCode",{parentName:"p"},"-m")," \u4f1a\u4f7f\u7528\u5f53\u524d\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"@midwayjs/core")," \u7248\u672c\uff0c\u66f4\u65b0\u7ec4\u4ef6\u5230\u6700\u517c\u5bb9\u7684\u7248\u672c\uff0c\u800c\u4e0d\u662f\u6700\u65b0\u7248\u672c\u3002"),(0,a.kt)("p",null,"\u7ed3\u5408 ",(0,a.kt)("inlineCode",{parentName:"p"},"mwtsc")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"midway-version")," \u5de5\u5177\uff0c\u53ef\u4ee5\u66f4\u7b80\u5355\u7684\u7ba1\u7406\u7248\u672c\uff0c\u5982\u6709\u95ee\u9898\u53ef\u4ee5\u53cd\u9988\u7ed9\u6211\u4eec\u6539\u8fdb\u3002"))}u.isMDXComponent=!0}}]);