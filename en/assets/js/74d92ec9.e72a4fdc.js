"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[80326],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},y=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=c(n),y=i,m=u["".concat(l,".").concat(y)]||u[y]||d[y]||a;return n?r.createElement(m,o(o({ref:t},p),{},{components:n})):r.createElement(m,o({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=y;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:i,o[1]=s;for(var c=2;c<a;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}y.displayName="MDXCreateElement"},95140:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var r=n(87462),i=(n(67294),n(3905));const a={},o="Retryable",s={unversionedId:"retry",id:"retry",title:"Retryable",description:"Starting from Midway v3.5.0, method custom retry logic is supported.",source:"@site/i18n/en/docusaurus-plugin-content-docs/current/retry.md",sourceDirName:".",slug:"/retry",permalink:"/en/docs/retry",draft:!1,editUrl:"https://github.com/midwayjs/midway/tree/main/site/docs/retry.md",tags:[],version:"current",frontMatter:{},sidebar:"common",previous:{title:"\u6570\u636e\u54cd\u5e94",permalink:"/en/docs/data_response"},next:{title:"Extended context definition",permalink:"/en/docs/context_definition"}},l={},c=[{value:"Define retry functions",id:"define-retry-functions",level:2},{value:"This binding",id:"this-binding",level:2},{value:"Number of retries",id:"number-of-retries",level:2},{value:"Retry of synchronization",id:"retry-of-synchronization",level:2},{value:"Retry delay",id:"retry-delay",level:2},{value:"Error thrown",id:"error-thrown",level:2}],p={toc:c},u="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"retryable"},"Retryable"),(0,i.kt)("p",null,"Starting from Midway v3.5.0, method custom retry logic is supported."),(0,i.kt)("p",null,"Many times, we need to use ",(0,i.kt)("inlineCode",{parentName:"p"},"try")," multiple times to wrap the function and handle errors on some method calls that are prone to failure or asynchronous."),(0,i.kt)("p",null,"For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// Defines an asynchronous function\n\nasync function invoke(id) {\n\n  // Some remote call logic\n\n}\n\n\nasync invokeNew() {\n  let error;\n  try {\n    return await invoke(1);\n  } catch(err) {\n    error = err;\n  }\n\n  try {\n    return await invoke(2);\n  } catch(err) {\n    error = err;\n  }\n\n  if (error) {\n    // ....\n  }\n}\n")),(0,i.kt)("p",null,"You may try to call the ",(0,i.kt)("inlineCode",{parentName:"p"},"invoke")," operation multiple times and use the try/catch to catch exceptions, resulting in repeated and lengthy business code writing."),(0,i.kt)("h2",{id:"define-retry-functions"},"Define retry functions"),(0,i.kt)("p",null,"We can use ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWithAsync")," method to package and simplify the whole process."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { retryWithAsync } from '@midwayjs/core';\n\nasync function invoke(id) {\n  // ...\n}\n\nasync function someServiceMethod() {\n  // The default call, plus two retries, can be executed up to three times.\n  const invokeNew = retryWithAsync(invoke, 2);\n\n  try {\n    return await invokeNew(1);\n  } catch(err) {\n\n    // err\n  }\n}\n")),(0,i.kt)("p",null,"The method parameters and return values after the package are exactly the same as the original method."),(0,i.kt)("p",null,"When the call is successful within the retry period and no error is thrown, the successful return value will be returned."),(0,i.kt)("p",null,"If it fails, the ",(0,i.kt)("inlineCode",{parentName:"p"},"MidwayRetryExceededMaxTimesError")," exception will be thrown."),(0,i.kt)("p",null,"If it is used in a class, you may need to pay attention to the point of ",(0,i.kt)("inlineCode",{parentName:"p"},"this"),"."),(0,i.kt)("p",null,"Examples are as follows:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { retryWithAsync } from '@midwayjs/core';\n\nexport class UserService {\n\n  async getUserData(userId: string) {\n    // wrap\n    const getUserDataOrigin = retryWithAsync(\n      this.getUserDataFromRemote,\n      2,\n      {\n        receiver: this\n      }\n    );\n\n    // invoke\n    return getUserDataOrigin(userId);\n  }\n\n  async getUserDataFromRemote(userId: string) {\n    // get data from remote\n  }\n}\n")),(0,i.kt)("h2",{id:"this-binding"},"This binding"),(0,i.kt)("p",null,"Starting from Midway v3.5.1, a ",(0,i.kt)("inlineCode",{parentName:"p"},"receiver")," parameter has been added to bind this in the scene of the class for processing:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"1, the method of correct this point"),(0,i.kt)("li",{parentName:"ul"},"2, the correctness of the definition of the package method.")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// wrap\nconst getUserDataOrigin = retryWithAsync(\n  this.getUserDataFromRemote,\n  2,\n  {\n    receiver: this, // This parameter is used to handle this pointing\n  }\n);\n")),(0,i.kt)("p",null,"If there is no such parameter, the code needs to be written as follows to bind this, and the definition of the ",(0,i.kt)("inlineCode",{parentName:"p"},"getUserDataOrigin")," method returned is correct."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// wrap\nconst getUserDataOrigin = retryWithAsync(\n  this.getUserDataFromRemote.bind(this) as typeof this.getUserDataFromRemote,\n  2,\n  {\n    receiver: this\n  }\n);\n\n\n")),(0,i.kt)("h2",{id:"number-of-retries"},"Number of retries"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWithAsync")," provides a second parameter to declare the additional number of retries, which defaults to 1 (only retry once)."),(0,i.kt)("p",null,"This value refers to the number of additional retries after the default call."),(0,i.kt)("h2",{id:"retry-of-synchronization"},"Retry of synchronization"),(0,i.kt)("p",null,"Similar to ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWithAsync"),", we also provide ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWith")," synchronization method, the parameters and ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWithAsync")," are almost the same, no additional description."),(0,i.kt)("h2",{id:"retry-delay"},"Retry delay"),(0,i.kt)("p",null,"To prevent frequent retries from putting pressure on the server, you can set the retry interval."),(0,i.kt)("p",null,"For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const invokeNew = retryWithAsync(invoke, 2, {\n  retryInterval: 2000, //After the execution fails, continue to try again after 2s.\n});\n")),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"The synchronization method ",(0,i.kt)("inlineCode",{parentName:"p"},"retryWith")," does not have this attribute.")),(0,i.kt)("h2",{id:"error-thrown"},"Error thrown"),(0,i.kt)("p",null,"By default, if the number of retries is exceeded, the ",(0,i.kt)("inlineCode",{parentName:"p"},"MidwayRetryExceededMaxTimesError")," exception is thrown."),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"MidwayRetryExceededMaxTimesError")," is the default exception of the framework, which can be captured and combed by the error filter, or the original exception can be handled from its attributes."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { retryWithAsync, MidwayRetryExceededMaxTimesError } from '@midwayjs/core';\n\nasync function invoke(id) {\n  // ...\n}\n\nasync function someServiceMethod() {\n  // The default call, plus two retries, can be executed up to three times.\n  const invokeNew = retryWithAsync(invoke, 2);\n\n  try {\n    return await invokeNew(1);\n  } catch(err) {\n    // err.name === 'MidwayRetryExceededMaxTimesError'\n    // err.cause instanceof CustomError => true\n  }\n\n}\n\nasync invokeNew() {\n  throw new CustomError('customError');\n}\n")),(0,i.kt)("p",null,"If you want to throw the original error object directly, you can configure the parameters."),(0,i.kt)("p",null,"For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const invokeNew = retryWithAsync(invoke, 2, {\n  throwOriginError: true\n});\n")))}d.isMDXComponent=!0}}]);