"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[14760],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),d=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,s=r(e,["components","mdxType","originalType","parentName"]),m=d(n),f=i,c=m["".concat(p,".").concat(f)]||m[f]||u[f]||o;return n?a.createElement(c,l(l({ref:t},s),{},{components:n})):a.createElement(c,l({ref:t},s))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,l=new Array(o);l[0]=f;var r={};for(var p in t)hasOwnProperty.call(t,p)&&(r[p]=t[p]);r.originalType=e,r[m]="string"==typeof e?e:i,l[1]=r;for(var d=2;d<o;d++)l[d]=n[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}f.displayName="MDXCreateElement"},2574:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>r,toc:()=>d});var a=n(87462),i=(n(67294),n(3905));const o={},l="File Upload",r={unversionedId:"extensions/upload",id:"extensions/upload",title:"File Upload",description:"Universal upload component for @midwayjs/faas, @midwayjs/web, @midwayjs/koa and @midwayjs/express multiple frameworks, supports file (server temporary file) and stream (stream) two modes.",source:"@site/i18n/en/docusaurus-plugin-content-docs/current/extensions/upload.md",sourceDirName:"extensions",slug:"/extensions/upload",permalink:"/en/docs/extensions/upload",draft:!1,editUrl:"https://github.com/midwayjs/midway/tree/main/site/docs/extensions/upload.md",tags:[],version:"current",frontMatter:{},sidebar:"component",previous:{title:"Template rendering",permalink:"/en/docs/extensions/render"},next:{title:"Authentication",permalink:"/en/docs/extensions/passport"}},p={},d=[{value:"Install dependencies",id:"install-dependencies",level:2},{value:"Enable component",id:"enable-component",level:2},{value:"configuration",id:"configuration",level:2},{value:"default allocation",id:"default-allocation",level:3},{value:"Upload mode - file",id:"upload-mode---file",level:3},{value:"Upload mode - stream",id:"upload-mode---stream",level:3},{value:"Upload whitelist",id:"upload-whitelist",level:3},{value:"MIME type checking",id:"mime-type-checking",level:3},{value:"Configure match or ignore",id:"configure-match-or-ignore",level:3},{value:"Same name Field",id:"same-name-field",level:3},{value:"Temporary files and cleanup",id:"temporary-files-and-cleanup",level:2},{value:"Safety warning",id:"safety-warning",level:2},{value:"Front-end file upload example",id:"front-end-file-upload-example",level:2},{value:"1. The form of html form",id:"1-the-form-of-html-form",level:3},{value:"2. Fetch FormData method",id:"2-fetch-formdata-method",level:3},{value:"Postman test example",id:"postman-test-example",level:2}],s={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"file-upload"},"File Upload"),(0,i.kt)("p",null,"Universal upload component for ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/faas"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/web"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/express")," multiple frameworks, supports ",(0,i.kt)("inlineCode",{parentName:"p"},"file")," (server temporary file) and ",(0,i.kt)("inlineCode",{parentName:"p"},"stream")," (stream) two modes."),(0,i.kt)("p",null,"Related Information:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"web support"),(0,i.kt)("th",{parentName:"tr",align:null}))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"@midwayjs/koa"),(0,i.kt)("td",{parentName:"tr",align:null},"\u2705")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"@midwayjs/faas"),(0,i.kt)("td",{parentName:"tr",align:null},"\ud83d\udcac")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"@midwayjs/web"),(0,i.kt)("td",{parentName:"tr",align:null},"\u2705")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"@midwayjs/express"),(0,i.kt)("td",{parentName:"tr",align:null},"\u2705")))),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"\ud83d\udcac Some function computing platforms do not support streaming request responses. Please refer to the corresponding platform capabilities.")),(0,i.kt)("h2",{id:"install-dependencies"},"Install dependencies"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"$ npm i @midwayjs/upload@3 --save\n")),(0,i.kt)("p",null,"Or add the following dependencies in ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," and reinstall."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n   "dependencies": {\n     "@midwayjs/upload": "^3.0.0",\n     //...\n   },\n   "devDependencies": {\n     //...\n   }\n}\n')),(0,i.kt)("h2",{id:"enable-component"},"Enable component"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Configuration } from '@midwayjs/core';\nimport * as upload from '@midwayjs/upload';\n\n@Configuration({\n   imports: [\n     // ...other components\n     upload\n   ],\n   //...\n})\nexport class MainConfiguration {}\n")),(0,i.kt)("ol",{start:3},(0,i.kt)("li",{parentName:"ol"},"Get the uploaded file in the code")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Controller, Inject, Post, Files, Fields } from '@midwayjs/core';\n\n@Controller('/')\nexport class HomeController {\n\n   @Inject()\n   ctx;\n\n   @Post('/upload')\n   async upload(@Files() files, @Fields() fields) {\n     /*\n     files = [\n       {\n         filename: 'test.pdf', // original name of the file\n         data: '/var/tmp/xxx.pdf', // when the mode is file, it is the server temporary file address\n         fieldname: 'test1', // form field name\n         mimeType: 'application/pdf', // mime\n       },\n       {\n         filename: 'test.pdf', // original name of the file\n         data: ReadStream, // when the mode is stream, it is the server temporary file address\n         fieldname: 'test2', // form field name\n         mimeType: 'application/pdf', // mime\n       },\n       // ...file supports uploading multiple files at the same time\n     ]\n\n     */\n     return {\n       files,\n       fields\n     }\n   }\n}\n")),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"If the swagger component is enabled at the same time, please be sure to add the type of the upload parameter (the type corresponding to the decorator, and the type in @ApiBody), otherwise an error will be reported. For more information, please refer to the file upload section of swagger.")),(0,i.kt)("h2",{id:"configuration"},"configuration"),(0,i.kt)("h3",{id:"default-allocation"},"default allocation"),(0,i.kt)("p",null,"The default configuration is as follows, and generally does not need to be modified."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { uploadWhiteList } from '@midwayjs/upload';\nimport { tmpdir } from 'os';\nimport { join } from 'path';\n\nexport default {\n   //...\n   upload: {\n     // mode: UploadMode, the default is file, that is, upload to the temporary directory of the server, and can be configured as stream\n     mode: 'file',\n     // fileSize: string, the maximum upload file size, the default is 10mb\n     fileSize: '10mb',\n     // whitelist: string[], file extension whitelist\n     whitelist: uploadWhiteList. filter(ext => ext !== '.pdf'),\n     // tmpdir: string, temporary storage path for uploaded files\n     tmpdir: join(tmpdir(), 'midway-upload-files'),\n     // cleanTimeout: number, how long the uploaded file is automatically deleted in the temporary directory, the default is 5 minutes\n     cleanTimeout: 5 * 60 * 1000,\n     // base64: boolean, set whether the original body is in base64 format, the default is false, generally used for compatibility with Tencent Cloud\n     base64: false,\n     // Parse the file information in the body only when the matching path reaches /api/upload\n     match: /\\/api\\/upload/,\n   },\n}\n\n")),(0,i.kt)("h3",{id:"upload-mode---file"},"Upload mode - file"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"file")," is the default and recommended by the framework."),(0,i.kt)("p",null,"Configure upload mode as ",(0,i.kt)("inlineCode",{parentName:"p"},"file")," string, or use ",(0,i.kt)("inlineCode",{parentName:"p"},"UploadMode.File")," exported by ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," package."),(0,i.kt)("p",null,"When using the file mode, the ",(0,i.kt)("inlineCode",{parentName:"p"},"data")," obtained from ",(0,i.kt)("inlineCode",{parentName:"p"},"this.ctx.files")," is the ",(0,i.kt)("inlineCode",{parentName:"p"},"temporary file address")," of the uploaded file on the server, and the content of this file can be obtained later by ",(0,i.kt)("inlineCode",{parentName:"p"},"fs.createReadStream")," and other methods."),(0,i.kt)("p",null,"When using the file mode, it supports uploading multiple files at the same time, and multiple files will be stored in ",(0,i.kt)("inlineCode",{parentName:"p"},"this.ctx.files")," in the form of an array."),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"When the ",(0,i.kt)("inlineCode",{parentName:"p"},"file")," mode is adopted, since the upload component will match according to the ",(0,i.kt)("inlineCode",{parentName:"p"},"method")," of the request and some of the iconic content in ",(0,i.kt)("inlineCode",{parentName:"p"},"headers")," when receiving the request, if it is considered to be a file upload request, the request will be Parse and ",(0,i.kt)("inlineCode",{parentName:"p"},"write")," the files in it to the temporary cache directory of the server. You can set the path that allows parsing files through ",(0,i.kt)("inlineCode",{parentName:"p"},"match")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"ignore")," configuration of this component."),(0,i.kt)("p",{parentName:"admonition"},"After configuring ",(0,i.kt)("inlineCode",{parentName:"p"},"match")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"ignore"),", you can ensure that your normal post and other request interfaces will not be illegally used by users for uploading, and you can ",(0,i.kt)("inlineCode",{parentName:"p"},"avoid")," the risk of the server cache being full."),(0,i.kt)("p",{parentName:"admonition"},"You can check the section ",(0,i.kt)("inlineCode",{parentName:"p"},"Configuring the upload path to allow (match) or ignore (ignore)")," below to configure it.")),(0,i.kt)("h3",{id:"upload-mode---stream"},"Upload mode - stream"),(0,i.kt)("p",null,"Configure upload mode as ",(0,i.kt)("inlineCode",{parentName:"p"},"stream")," string, or use ",(0,i.kt)("inlineCode",{parentName:"p"},"UploadMode.Stream")," exported by ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," package to configure."),(0,i.kt)("p",null,"When using the stream mode, the ",(0,i.kt)("inlineCode",{parentName:"p"},"data")," obtained from ",(0,i.kt)("inlineCode",{parentName:"p"},"this.ctx.files")," is ",(0,i.kt)("inlineCode",{parentName:"p"},"ReadStream"),", and then the data stream can be transferred to other ",(0,i.kt)("inlineCode",{parentName:"p"},"WriteStream")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"TransformStream")," through ",(0,i.kt)("inlineCode",{parentName:"p"},"pipe")," and other methods."),(0,i.kt)("p",null,"When using stream mode, only one file is uploaded at the same time, that is, there is only one file data object in ",(0,i.kt)("inlineCode",{parentName:"p"},"this.ctx.files")," array."),(0,i.kt)("p",null,"In addition, the stream mode ",(0,i.kt)("inlineCode",{parentName:"p"},"will not")," generate temporary files on the server, so there is no need to manually clear the temporary file cache after getting the uploaded content."),(0,i.kt)("h3",{id:"upload-whitelist"},"Upload whitelist"),(0,i.kt)("p",null,"Through the ",(0,i.kt)("inlineCode",{parentName:"p"},"whitelist")," attribute, configure the file extensions that are allowed to be uploaded. If ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," is configured, the extensions will not be verified."),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"If the configuration is ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),", the suffix name of the uploaded file will not be verified. If the file upload mode (mode=file) is adopted, it may be used by attackers to upload ",(0,i.kt)("inlineCode",{parentName:"p"},".php"),", ",(0,i.kt)("inlineCode",{parentName:"p"},".asp")," and other suffixes The WebShell implements the attack behavior."),(0,i.kt)("p",{parentName:"admonition"},"Of course, since the ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," component will ",(0,i.kt)("inlineCode",{parentName:"p"},"rerandomly generate")," the file name of the uploaded temporary file, as long as the developer ",(0,i.kt)("inlineCode",{parentName:"p"},"does not return")," the address of the uploaded temporary file to the user, then even if the user uploads For some unexpected files, there is no need to worry too much about being used.")),(0,i.kt)("p",null,"If the uploaded file suffix does not match, a ",(0,i.kt)("inlineCode",{parentName:"p"},"400")," error will be responded, and the default values are as follows:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"'.jpg',\n'.jpeg',\n'.png',\n'.gif',\n'.bmp',\n'.wbmp',\n'.webp',\n'.tif',\n'.psd',\n'.svg',\n'.js',\n'.jsx',\n'.json',\n'.css',\n'.less',\n'.html',\n'.htm',\n'.xml',\n'.pdf',\n'.zip',\n'.gz',\n'.tgz',\n'.gzip',\n'.mp3',\n'.mp4',\n'.avi',\n")),(0,i.kt)("p",null,"The default suffix whitelist can be obtained through the ",(0,i.kt)("inlineCode",{parentName:"p"},"uploadWhiteList")," exported in the ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," package."),(0,i.kt)("p",null,"In addition, midway upload component, in order to avoid some ",(0,i.kt)("inlineCode",{parentName:"p"},"malicious users"),", uses some technical means to ",(0,i.kt)("inlineCode",{parentName:"p"},"forge")," some extensions that can be truncated, so it will filter the binary data of the obtained extensions, and only support ",(0,i.kt)("inlineCode",{parentName:"p"},"0x2e")," (that is, the English dot ",(0,i.kt)("inlineCode",{parentName:"p"},"."),"), ",(0,i.kt)("inlineCode",{parentName:"p"},"0x30-0x39")," (that is, the number ",(0,i.kt)("inlineCode",{parentName:"p"},"0-9"),"), ",(0,i.kt)("inlineCode",{parentName:"p"},"0x61-0x7a")," (that is, the lowercase letters ",(0,i.kt)("inlineCode",{parentName:"p"},"a-z"),") are used as extensions, and other characters will be Automatically ignored."),(0,i.kt)("p",null,"Starting with v3.14.0, you can pass a function that can dynamically return a whitelist based on different conditions."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { uploadWhiteList } from '@midwayjs/upload';\nimport { tmpdir } from 'os';\nimport { join } from 'path';\n\nexport default {\n   // ...\n   upload: {\n     whitelist: (ctx) => {\n       if (ctx.path === '/') {\n         return [\n           '.jpg',\n           '.jpeg',\n         ];\n       } else {\n         return [\n           '.jpg',\n         ]\n       };\n     },\n     // ...\n   },\n}\n")),(0,i.kt)("h3",{id:"mime-type-checking"},"MIME type checking"),(0,i.kt)("p",null,"Some ",(0,i.kt)("inlineCode",{parentName:"p"},"malicious users")," will try to modify the extension of ",(0,i.kt)("inlineCode",{parentName:"p"},".php")," and other WebShells to ",(0,i.kt)("inlineCode",{parentName:"p"},".jpg")," to bypass the whitelist filtering rules based on the extension. In some server environments, this jpg file will still be used as PHP scripts to execute, pose a security risk."),(0,i.kt)("p",null,"Therefore, the ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," component provides the ",(0,i.kt)("inlineCode",{parentName:"p"},"mimeTypeWhiteList")," configuration parameter ",(0,i.kt)("strong",{parentName:"p"},"\u3010Please note that this parameter has no default value setting, that is, no verification by default\u3011"),", you can set the allowed file MIME format through this configuration, A rule is a ",(0,i.kt)("inlineCode",{parentName:"p"},"secondary array")," consisting of an array ",(0,i.kt)("inlineCode",{parentName:"p"},"[extension, mime, [...moreMime]]"),", for example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { uploadWhiteList } from '@midwayjs/upload';\nexport default {\n   //...\n   upload: {\n     //...\n     // extension whitelist\n     whitelist: uploadWhiteList,\n     // Only the following file types are allowed to be uploaded\n     mimeTypeWhiteList: {\n       '.jpg': 'image/jpeg',\n       // Multiple MIME types can also be set, for example, the following files that allow the .jpeg suffix are jpg or png\n       '.jpeg': ['image/jpeg', 'image/png'],\n       // other types\n       '.gif': 'image/gif',\n       '.bmp': 'image/bmp',\n       '.wbmp': 'image/vnd.wap.wbmp',\n       '.webp': 'image/webp',\n     }\n   },\n}\n")),(0,i.kt)("p",null,"You can also use the ",(0,i.kt)("inlineCode",{parentName:"p"},"DefaultUploadFileMimeType")," variable provided by the ",(0,i.kt)("inlineCode",{parentName:"p"},"@midwayjs/upload")," component as the default MIME validation rule, which provides commonly used ",(0,i.kt)("inlineCode",{parentName:"p"},".jpg"),", ",(0,i.kt)("inlineCode",{parentName:"p"},".png"),", ",(0,i.kt)("inlineCode",{parentName:"p"},".psd")," and other file extensions MIME data:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { uploadWhiteList, DefaultUploadFileMimeType } from '@midwayjs/upload';\nexport default {\n   //...\n   upload: {\n     //...\n     // extension whitelist\n     whitelist: uploadWhiteList,\n     // Only the following file types are allowed to be uploaded\n     mimeTypeWhiteList: DefaultUploadFileMimeType,\n   },\n}\n")),(0,i.kt)("p",null,"You can query the file format and corresponding MIME mapping through ",(0,i.kt)("inlineCode",{parentName:"p"},"https://mimetype.io/"),". For the MIME identification of files, we use ","[file-type@16]","(",(0,i.kt)("a",{parentName:"p",href:"https://www."},"https://www.")," npmjs.com/package/file-type) this npm package, please note the file types it supports."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"The MIME type verification rule is only applicable to the file upload mode ",(0,i.kt)("inlineCode",{parentName:"p"},"mode=file"),", and after setting this verification rule, since the file content needs to be read for matching, the upload performance will be slightly affected."),(0,i.kt)("p",{parentName:"admonition"},"However, we still recommend that you set the ",(0,i.kt)("inlineCode",{parentName:"p"},"mimeTypeWhiteList")," parameter if possible, which will improve your application security.")),(0,i.kt)("p",null,"Starting with v3.14.0, you can pass a function that dynamically returns MIME rules based on different conditions."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { tmpdir } from 'os';\nimport { join } from 'path';\n\nexport default {\n   // ...\n   upload: {\n     mimeTypeWhiteList: (ctx) => {\n       if (ctx.path === '/') {\n         return {\n           '.jpg': 'image/jpeg',\n         };\n       } else {\n         return {\n           '.jpeg': ['image/jpeg', 'image/png'],\n         }\n       };\n     }\n   },\n}\n")),(0,i.kt)("h3",{id:"configure-match-or-ignore"},"Configure match or ignore"),(0,i.kt)("p",null,"When the upload component is enabled, when the ",(0,i.kt)("inlineCode",{parentName:"p"},"method")," of the request is one of ",(0,i.kt)("inlineCode",{parentName:"p"},"POST/PUT/DELETE/PATCH"),", if it is judged that ",(0,i.kt)("inlineCode",{parentName:"p"},"headers['content-type']")," of the request contains ",(0,i.kt)("inlineCode",{parentName:"p"},"multipart/form-data")," and When ",(0,i.kt)("inlineCode",{parentName:"p"},"boundary")," is set, it will ",(0,i.kt)("inlineCode",{parentName:"p"},"**automatically enter**")," upload file parsing logic."),(0,i.kt)("p",null,"This will cause: If the user may manually analyze the request information of the website, manually call any interface such as ",(0,i.kt)("inlineCode",{parentName:"p"},"post"),", and upload a file, it will trigger the parsing logic of the ",(0,i.kt)("inlineCode",{parentName:"p"},"upload")," component, and create a file in the temporary directory The temporary cache of uploaded files will generate unnecessary ",(0,i.kt)("inlineCode",{parentName:"p"},"load")," on the website server, and may ",(0,i.kt)("inlineCode",{parentName:"p"},"affect")," the normal business logic processing of the server in severe cases."),(0,i.kt)("p",null,"Therefore, you can add ",(0,i.kt)("inlineCode",{parentName:"p"},"match")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"ignore")," configuration to the configuration to set which api paths are allowed to upload."),(0,i.kt)("h3",{id:"same-name-field"},"Same name Field"),(0,i.kt)("p",null,"The componennt support Field with the same name since v3.16.6."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default.ts\nimport { tmpdir } from 'os';\nimport { join } from 'path';\n\nexport default {\n  // ...\n  upload: {\n    allowFieldsDuplication: true\n  },\n}\n\n")),(0,i.kt)("p",null,"After ",(0,i.kt)("inlineCode",{parentName:"p"},"allowFieldsDuplication")," is enabled, Fields with the same name will be merged into an array."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Controller, Inject, Post, Files, Fields } from '@midwayjs/core';\n\n@Controller('/')\nexport class HomeController {\n  @Post('/upload')\n  async upload(@Files() files, @Fields() fields) {\n    /*\n    fields = {\n        name: ['name1', 'name2'],\n        otherName: 'nameOther'\n        // ...\n    }\n\n    */\n  }\n}\n")),(0,i.kt)("h2",{id:"temporary-files-and-cleanup"},"Temporary files and cleanup"),(0,i.kt)("p",null,"If you use the ",(0,i.kt)("inlineCode",{parentName:"p"},"file")," mode to get uploaded files, the uploaded files will be stored in the folder pointed to by the ",(0,i.kt)("inlineCode",{parentName:"p"},"tmpdir")," option in the configuration of the ",(0,i.kt)("inlineCode",{parentName:"p"},"upload")," component that you set in the ",(0,i.kt)("inlineCode",{parentName:"p"},"config")," file."),(0,i.kt)("p",null,"You can control the automatic temporary file cleanup time by using ",(0,i.kt)("inlineCode",{parentName:"p"},"cleanTimeout")," in the configuration, the default value is ",(0,i.kt)("inlineCode",{parentName:"p"},"5 * 60 * 1000"),", that is, the uploaded file will be automatically cleaned up after ",(0,i.kt)("inlineCode",{parentName:"p"},"5 minutes"),", set it to ",(0,i.kt)("inlineCode",{parentName:"p"},"0")," To disable the automatic cleaning function."),(0,i.kt)("p",null,"You can also actively clean up the temporary files uploaded by the current request by calling ",(0,i.kt)("inlineCode",{parentName:"p"},"await ctx.cleanupRequestFiles()")," in the code."),(0,i.kt)("h2",{id:"safety-warning"},"Safety warning"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Please pay attention to whether to enable ",(0,i.kt)("inlineCode",{parentName:"li"},"extension whitelist")," (whiteList), if the extension whitelist is set to ",(0,i.kt)("inlineCode",{parentName:"li"},"null"),", it may be used by attackers to upload ",(0,i.kt)("inlineCode",{parentName:"li"},".php"),", ",(0,i.kt)("inlineCode",{parentName:"li"},".asp")," and other WebShells."),(0,i.kt)("li",{parentName:"ol"},"Please pay attention to whether to set ",(0,i.kt)("inlineCode",{parentName:"li"},"match")," or ",(0,i.kt)("inlineCode",{parentName:"li"},"ignore")," rules, otherwise common ",(0,i.kt)("inlineCode",{parentName:"li"},"POST/PUT")," and other interfaces may be exploited by attackers, resulting in increased server load and large space occupation."),(0,i.kt)("li",{parentName:"ol"},"Please pay attention to whether to set the ",(0,i.kt)("inlineCode",{parentName:"li"},"file type rule")," (fileTypeWhiteList), otherwise the attacker may forge the file type to upload.")),(0,i.kt)("h2",{id:"front-end-file-upload-example"},"Front-end file upload example"),(0,i.kt)("h3",{id:"1-the-form-of-html-form"},"1. The form of html form"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<form action="/api/upload" method="post" enctype="multipart/form-data">\n   Name: <input type="text" name="name" /><br />\n   File: <input type="file" name="testFile" /><br />\n   <input type="submit" value="Submit" />\n</form>\n')),(0,i.kt)("h3",{id:"2-fetch-formdata-method"},"2. Fetch FormData method"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const fileInput = document. querySelector('#your-file-input');\nconst formData = new FormData();\nformData.append('file', fileInput.files[0]);\n\nfetch('/api/upload', {\n   method: 'POST',\n   body: formData,\n});\n")),(0,i.kt)("h2",{id:"postman-test-example"},"Postman test example"),(0,i.kt)("p",null,(0,i.kt)("img",{parentName:"p",src:"https://img.alicdn.com/imgextra/i4/O1CN01iv9ESW1uIShNiRjBF_!!6000000006014-2-tps-2086-1746.png",alt:null})))}u.isMDXComponent=!0}}]);