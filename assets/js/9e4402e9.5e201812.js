"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[11347],{3905:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>d});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var m=a.createContext({}),s=function(e){var t=a.useContext(m),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},l=function(e){var t=s(e.components);return a.createElement(m.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,m=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),p=s(r),f=n,d=p["".concat(m,".").concat(f)]||p[f]||u[f]||i;return r?a.createElement(d,o(o({ref:t},l),{},{components:r})):a.createElement(d,o({ref:t},l))}));function d(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=f;var c={};for(var m in t)hasOwnProperty.call(t,m)&&(c[m]=t[m]);c.originalType=e,c[p]="string"==typeof e?e:n,o[1]=c;for(var s=2;s<i;s++)o[s]=r[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},90773:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>m,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>c,toc:()=>s});var a=r(87462),n=(r(67294),r(3905));const i={date:"2021-05-07T20:00"},o="v2.10.12",c={permalink:"/changelog/v2.10.12",source:"@site/changelog/source/v2.10.12.md",title:"v2.10.12",description:"Bug Fixes",date:"2021-05-07T20:00:00.000Z",formattedDate:"2021\u5e745\u67087\u65e5",tags:[],hasTruncateMarker:!0,authors:[],frontMatter:{date:"2021-05-07T20:00"},prevItem:{title:"v2.10.13",permalink:"/changelog/v2.10.13"},nextItem:{title:"v2.10.11",permalink:"/changelog/v2.10.11"},listPageLink:"/changelog/page/10"},m={authorsImageUrls:[]},s=[{value:"Bug Fixes",id:"bug-fixes",level:3}],l={toc:s},p="wrapper";function u(e){let{components:t,...r}=e;return(0,n.kt)(p,(0,a.Z)({},l,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h3",{id:"bug-fixes"},"Bug Fixes"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"change all requestMethod to real method for serverless http request (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1028"},"#1028"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/23e29436e3a1b3ab10484171f0dfcd5de068f124"},"23e2943"),")"),(0,n.kt)("li",{parentName:"ul"},"disable wait event loop in tencent serverless (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1029"},"#1029"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/89d5c2ec9b83f619d72b31cc003a41bc691a1f19"},"89d5c2e"),")"),(0,n.kt)("li",{parentName:"ul"},"output serverless error in some environment (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1030"},"#1030"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/b162b897812d1a1a5e981328fbbb43aa75eacf10"},"b162b89"),")"),(0,n.kt)("li",{parentName:"ul"},"remove winston-daily-rotate-file (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1032"},"#1032"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/ae242c10439b035e42634e723af0a0f9b92da239"},"ae242c1"),")"),(0,n.kt)("li",{parentName:"ul"},"serverless logger close when runtime stop (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1022"},"#1022"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/28548da888005047123523066ca47207f02eb1c8"},"28548da"),")"),(0,n.kt)("li",{parentName:"ul"},"throw error when router duplicate (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1023"},"#1023"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/61bc58d29d637f1c9e54fec0a09f24d90c1286c9"},"61bc58d"),")"),(0,n.kt)("li",{parentName:"ul"},"use egg-logger got empty logger (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/issues/1031"},"#1031"),") (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/midwayjs/midway/commit/4077c70a71507477c7a5fa15449771cc395bc0c0"},"4077c70"),")")))}u.isMDXComponent=!0}}]);