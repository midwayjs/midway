"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[73187],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),c=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=c(e.components);return a.createElement(l.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=c(n),u=r,k=d["".concat(l,".").concat(u)]||d[u]||m[u]||o;return n?a.createElement(k,i(i({ref:t},p),{},{components:n})):a.createElement(k,i({ref:t},p))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:r,i[1]=s;for(var c=2;c<o;c++)i[c]=n[c];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},94875:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>o,metadata:()=>s,toc:()=>c});var a=n(87462),r=(n(67294),n(3905));const o={},i="WebSocket",s={unversionedId:"extensions/ws",id:"extensions/ws",title:"WebSocket",description:"The ws module is an implementation of a WebSocket protocol on the Node side, which allows the client (usually the browser) to persist and connect to the server side.",source:"@site/i18n/en/docusaurus-plugin-content-docs/current/extensions/ws.md",sourceDirName:"extensions",slug:"/extensions/ws",permalink:"/en/docs/extensions/ws",draft:!1,editUrl:"https://github.com/midwayjs/midway/tree/main/site/docs/extensions/ws.md",tags:[],version:"current",frontMatter:{},sidebar:"component",previous:{title:"SocketIO",permalink:"/en/docs/extensions/socketio"},next:{title:"RabbitMQ",permalink:"/en/docs/extensions/rabbitmq"}},l={},c=[{value:"Installation dependency",id:"installation-dependency",level:2},{value:"Open the component",id:"open-the-component",level:2},{value:"Directory structure",id:"directory-structure",level:2},{value:"Socket service",id:"socket-service",level:2},{value:"Messages and responses",id:"messages-and-responses",level:2},{value:"WebSocket Server instance",id:"websocket-server-instance",level:2},{value:"Heartbeat check",id:"heartbeat-check",level:2},{value:"Local test",id:"local-test",level:2},{value:"Configure test ports",id:"configure-test-ports",level:3},{value:"Test code",id:"test-code",level:3},{value:"Test client",id:"test-client",level:3},{value:"Configuration",id:"configuration",level:2},{value:"Default configuration",id:"default-configuration",level:2}],p={toc:c},d="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"websocket"},"WebSocket"),(0,r.kt)("p",null,"The ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/ws"},"ws")," module is an implementation of a WebSocket protocol on the Node side, which allows the client (usually the browser) to persist and connect to the server side.\nThis feature of continuous connection makes WebSocket particularly suitable for use in scenarios such as games or chat rooms."),(0,r.kt)("p",null,"Midway provides support and encapsulation of ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/ws"},"ws")," module, which can simply create a WebSocket service."),(0,r.kt)("p",null,"Related information:"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Provide services")),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null}))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"Can be used for standard projects"),(0,r.kt)("td",{parentName:"tr",align:null},"\u2705")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"Can be used for Serverless"),(0,r.kt)("td",{parentName:"tr",align:null},"\u274c")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"Can be used for integration"),(0,r.kt)("td",{parentName:"tr",align:null},"\u2705")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"Contains independent main framework"),(0,r.kt)("td",{parentName:"tr",align:null},"\u274c")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"Contains independent logs"),(0,r.kt)("td",{parentName:"tr",align:null},"\u274c")))),(0,r.kt)("h2",{id:"installation-dependency"},"Installation dependency"),(0,r.kt)("p",null,"Install WebSocket dependencies in existing projects."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"$ npm i @midwayjs/ws@3 --save\n")),(0,r.kt)("p",null,"Or reinstall the following dependencies in ",(0,r.kt)("inlineCode",{parentName:"p"},"package.json"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "dependencies": {\n    "@midwayjs/ws": "^3.0.0",\n    // ...\n  }\n}\n')),(0,r.kt)("h2",{id:"open-the-component"},"Open the component"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/ws")," can be used as an independent main framework."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/configuration.ts\nimport { Configuration } from '@midwayjs/core';\nimport * as ws from '@midwayjs/ws';\n\n@Configuration({\n  imports: [ws]\n  // ...\n})\nexport class MainConfiguration {\n  async onReady() {\n        // ...\n  }\n}\n\n")),(0,r.kt)("p",null,"It can also be attached to other main frameworks, such as ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/configuration.ts\nimport { Configuration } from '@midwayjs/core';\nimport * as koa from '@midwayjs/koa';\nimport * as ws from '@midwayjs/ws';\n\n@Configuration({\n  imports: [koa, ws]\n  // ...\n})\nexport class MainConfiguration {\n  async onReady() {\n        // ...\n  }\n}\n\n")),(0,r.kt)("h2",{id:"directory-structure"},"Directory structure"),(0,r.kt)("p",null,"The following is the basic directory structure of WebSocket project. Similar to traditional applications, we have created a ",(0,r.kt)("inlineCode",{parentName:"p"},"socket")," directory to store service codes for WebSocket services."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},".\n\u251c\u2500\u2500 package.json\n\u251c\u2500\u2500 src\n\u2502   \u251c\u2500\u2500 configuration.ts          ## entry configuration file\n\u2502   \u251c\u2500\u2500 interface.ts\n\u2502   \u2514\u2500\u2500 socket                    ## ws service file\n\u2502       \u2514\u2500\u2500 hello.controller.ts\n\u251c\u2500\u2500 test\n\u251c\u2500\u2500 bootstrap.js                  ## service startup portal\n\u2514\u2500\u2500 tsconfig.json\n")),(0,r.kt)("h2",{id:"socket-service"},"Socket service"),(0,r.kt)("p",null,"Midway defines WebSocket services through the ",(0,r.kt)("inlineCode",{parentName:"p"},"@WSController")," decorator."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { WSController } from '@midwayjs/core';\n\n@WSController()\nexport class HelloSocketController {\n  // ...\n}\n")),(0,r.kt)("p",null,"When there is a client connection, ",(0,r.kt)("inlineCode",{parentName:"p"},"connection")," event will be triggered. We can use the ",(0,r.kt)("inlineCode",{parentName:"p"},"@OnWSConnection()")," decorator in the code to decorate a method. When each client connects to the service for the first time, the method will be automatically called."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { WSController, OnWSConnection, Inject } from '@midwayjs/core';\nimport { Context } from '@midwayjs/ws';\nimport * as http from 'http';\n\n@WSController()\nexport class HelloSocketController {\n\n  @Inject()\n  ctx: Context;\n\n  @OnWSConnection()\n  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {\n    console.log('namespace / got a connection ${this.ctx.readyState}');\n  }\n}\n\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"The ctx here is equivalent to the WebSocket instance.")),(0,r.kt)("h2",{id:"messages-and-responses"},"Messages and responses"),(0,r.kt)("p",null,"The WebSocket is to obtain data by monitoring events. Midway provides a ",(0,r.kt)("inlineCode",{parentName:"p"},"@OnWSMessage()")," decorator to format the received event. Every time the client sends an event, the modified method will be executed."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { WSController, OnWSMessage, Inject } from '@midwayjs/core';\nimport { Context } from '@midwayjs/ws';\n\n@WSController()\nexport class HelloSocketController {\n\n  @Inject()\n  ctx: Context;\n\n  @OnWSMessage('message')\n  async gotMessage(data) {\n    return { name: 'harry', result: parseInt(data) +5 };\n  }\n}\n\n")),(0,r.kt)("p",null,"We can send messages to all connected clients through the ",(0,r.kt)("inlineCode",{parentName:"p"},"@WSBroadCast")," decorator."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { WSController, OnWSConnection, Inject } from '@midwayjs/core';\nimport { Context } from '@midwayjs/ws';\n\n@WSController()\nexport class HelloSocketController {\n\n  @Inject()\n  ctx: Context;\n\n  @OnWSMessage('message')\n  @WSBroadCast()\n  async gotMyMessage(data) {\n    return { name: 'harry', result: parseInt(data) +5 };\n  }\n\n  @OnWSDisConnection()\n  async disconnect(id: number) {\n    console.log('disconnect '+ id);\n  }\n}\n\n")),(0,r.kt)("p",null,"With the ",(0,r.kt)("inlineCode",{parentName:"p"},"@OnWSDisConnection")," decorator, do some extra processing when the client is disconnected."),(0,r.kt)("h2",{id:"websocket-server-instance"},"WebSocket Server instance"),(0,r.kt)("p",null,"The App provided by this component is the WebSocket Server instance itself, which can be obtained as follows."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Controller, App } from '@midwayjs/core';\nimport { Application } from '@midwayjs/ws';\n\n@Controller()\nexport class HomeController {\n\n  @App('webSocket')\n  wsApp: Application;\n}\n")),(0,r.kt)("p",null,"For example, we can broadcast messages in other Controller or Service."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Controller, App } from '@midwayjs/core';\nimport { Application } from '@midwayjs/ws';\n\n@Controller()\nexport class HomeController {\n\n  @App('webSocket')\n  wsApp: Application;\n\n  async invoke() {\n    this.wsApp.clients.forEach(ws => {\n      // ws.send('something');\n    });\n  }\n}\n")),(0,r.kt)("h2",{id:"heartbeat-check"},"Heartbeat check"),(0,r.kt)("p",null,"Sometimes the connection between the server and the client may be interrupted, and neither the server nor the client is aware of the disconnection."),(0,r.kt)("p",null,"Heartbeat check proactive disconnect requests can be configured by enabling ",(0,r.kt)("inlineCode",{parentName:"p"},"enableServerHeartbeatCheck"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n   // ...\n   webSocket: {\n     enableServerHeartbeatCheck: true,\n   },\n}\n")),(0,r.kt)("p",null,"The default check time is ",(0,r.kt)("inlineCode",{parentName:"p"},"30*1000")," milliseconds, which can be modified through ",(0,r.kt)("inlineCode",{parentName:"p"},"serverHeartbeatInterval"),", and the configuration unit is milliseconds."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n   // ...\n   webSocket: {\n     serverHeartbeatInterval: 30000,\n   },\n}\n")),(0,r.kt)("p",null,"This configuration will automatically send ",(0,r.kt)("inlineCode",{parentName:"p"},"ping")," packets at regular intervals. If the client does not return a message in the next time interval, it will be automatically ",(0,r.kt)("inlineCode",{parentName:"p"},"terminate"),"."),(0,r.kt)("p",null,"If the client wants to know the status of the server, it can do so by listening to the ",(0,r.kt)("inlineCode",{parentName:"p"},"ping")," message."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import WebSocket from 'ws';\n\nfunction heartbeat() {\n   clearTimeout(this.pingTimeout);\n\n   // After each ping is received, delay and wait. If the server ping message is not received next time, it is considered that there is a problem.\n   this.pingTimeout = setTimeout(() => {\n     //Reconnect or abort\n   }, 30000 + 1000);\n}\n\nconst client = new WebSocket('wss://websocket-echo.com/');\n\n// ...\nclient.on('ping', heartbeat);\n")),(0,r.kt)("h2",{id:"local-test"},"Local test"),(0,r.kt)("h3",{id:"configure-test-ports"},"Configure test ports"),(0,r.kt)("p",null,"Because the ws framework can be started independently (attached to the default http service, it can also be started with other midway frameworks)."),(0,r.kt)("p",null,"When starting as a standalone framework, you need to specify a port."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  webSocket: {\n    port: 3000\n  },\n}\n")),(0,r.kt)("p",null,"When starting as a sub-framework (for example, and HTTP, because HTTP does not specify a port during a single test (automatically generated using SuperTest), it cannot be tested well, and only one port can be explicitly specified in the Test environment."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.unittest\nexport default {\n  // ...\n  koa: {\n    port: null\n  },\n  webSocket\n    port: 3000\n  },\n}\n")),(0,r.kt)("admonition",{type:"tip"},(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("ol",{parentName:"li"},(0,r.kt)("li",{parentName:"ol"},"The port here is only the port that the WebSocket service starts during testing."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("ol",{parentName:"li",start:2},(0,r.kt)("li",{parentName:"ol"},"The port in koa is null, which means that the http service will not be started without configuring the port in the test environment."))))),(0,r.kt)("h3",{id:"test-code"},"Test code"),(0,r.kt)("p",null,"Like other Midway testing methods, we use ",(0,r.kt)("inlineCode",{parentName:"p"},"createApp")," to start the project."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createApp, close } from '@midwayjs/mock'\n// The Framework definition used here is subject to the main framework.\nimport { Framework } from '@midwayjs/koa';\n\ndescribe('/test/index.test.ts', () => {\n\n  it('should create app and test webSocket', async () => {\n    const app = await createApp<Framework>();\n\n    //...\n\n    await close(app);\n  });\n\n});\n")),(0,r.kt)("h3",{id:"test-client"},"Test client"),(0,r.kt)("p",null,"You can use ",(0,r.kt)("inlineCode",{parentName:"p"},"ws")," to test. You can also use the ",(0,r.kt)("inlineCode",{parentName:"p"},"ws")," module-based test client provided by Midway."),(0,r.kt)("p",null,"For example:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createApp, close, createWebSocketClient } from '@midwayjs/mock';\nimport { sleep } from '@midwayjs/core';\n\n//... omit describe\n\nit('should test create websocket app', async () => {\n\n  // Create a service\n  const app = await createApp<Framework>();\n\n  // Create a client\n  const client = await createWebSocketClient('ws://localhost:3000');\n\n  const result = await new Promise(resolve => {\n\n    client.on('message', (data) => {\n      // xxxx\n      resolve(data);\n    });\n\n    // Send event\n    client.send(1);\n\n  });\n\n  // Judgment result\n  expect(JSON.parse(result)).toEqual({\n    name: 'harry',\n    result: 6\n  });\n\n  await sleep(1000);\n\n  // Close the client\n  await client.close();\n\n  // Close the server\n  await close(app);\n\n});\n")),(0,r.kt)("p",null,"Use the ",(0,r.kt)("inlineCode",{parentName:"p"},"once")," method of the ",(0,r.kt)("inlineCode",{parentName:"p"},"events")," module that comes with node to optimize the code."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { sleep } from '@midwayjs/core';\nimport { once } from 'events';\nimport { createApp, close, createWebSocketClient } from '@midwayjs/mock';\n\n//... omit describe\n\nit('should test create websocket app', async () => {\n\n  // Create a service\n  const app = await createApp<Framework>(process.cwd());\n\n  // Create a client\n  const client = await createWebSocketClient('ws://localhost:3000');\n\n  // Send event\n  client.send(1);\n\n  // Monitor with promise writing of events\n  let gotEvent = once(client, 'message');\n  // Waiting for return\n  let [data] = await gotEvent;\n\n  // Judgment result\n  expect(JSON.parse(data)).toEqual({\n    name: 'harry',\n    result: 6\n  });\n\n  await sleep(1000);\n\n  // Close the client\n  await client.close();\n\n  // Close the server\n  await close(app);\n});\n\n")),(0,r.kt)("p",null,"The two writing methods have the same effect, just write as you understand."),(0,r.kt)("h2",{id:"configuration"},"Configuration"),(0,r.kt)("h2",{id:"default-configuration"},"Default configuration"),(0,r.kt)("p",null,"The configuration sample of ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/ws")," is as follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  webSocket: {\n    port: 7001\n  },\n}\n")),(0,r.kt)("p",null,"When ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/ws")," and other ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/web"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/koa"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"@midwayjs/express")," are enabled at the same time, ports can be reused."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"// src/config/config.default\nexport default {\n  // ...\n  koa: {\n    port: 7001\n  }\n  webSocket: {\n    // No configuration here\n  },\n}\n")),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Property"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"port"),(0,r.kt)("td",{parentName:"tr",align:null},"number"),(0,r.kt)("td",{parentName:"tr",align:null},"Optionally, if the port is passed, ws will create an HTTP service for the port. If you want to work with other midway web frameworks, do not pass this parameter.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"server"),(0,r.kt)("td",{parentName:"tr",align:null},"httpServer"),(0,r.kt)("td",{parentName:"tr",align:null},"Optional, when passing port, you can specify an existing webServer")))),(0,r.kt)("p",null,"For more information about startup options, see ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/websockets/ws"},"ws documentation"),"."))}m.isMDXComponent=!0}}]);