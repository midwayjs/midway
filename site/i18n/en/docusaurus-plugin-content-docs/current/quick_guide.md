# Quick Start

If you haven't touched Midway, it doesn't matter. In this chapter, we will build a Midway standard application step by step from the perspective of examples to display weather information so that you can quickly get started with Midway.



## Environmental preparation

- Operating system: supports macOS,Linux,Windows
- Running environment: [Node.js environment requirements](/docs/intro#environmental-preparation).



## Initialize project

We recommend using scaffolding directly, with only a few simple instructions, you can quickly generate the project.

```bash
$ npm init midway
```

Select `koa-v3` to initialize the project. You can customize the project name, such as `weather-sample`.

Now you can start the application to experience it.

```bash
$ npm run dev
$ open http://localhost:7001
```

At the same time, we also provide a complete example. After `npm init midway`, you can select the `quick-start` project and create it, which is convenient for comparison and learning.



## Write Controller

If you are familiar with Web development or MVC, you know that we need to write [Controller and Router](./controller) in the first step.

Among the files created by scaffolding, we already have some files, and we temporarily ignore them.

In the `controller` directory, create a new `src/controller/weather.controller.ts` file with the following contents.

```typescript
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class WeatherController {
  // Here is the decorator, defining a route
  @Get('/weather')
  async getWeatherInfo(): Promise<string> {
    // This is the return of http, which can directly return strings, numbers, JSON,Buffer, etc.
    return 'Hello Weather!';
  }
}
```

Now we can return data through the access `/weather` interface.



## Add parameter processing

In the example, we need a URL parameter to dynamically show the weather in different cities.

You can add the `@Query` decorator to obtain the parameters on the URL.

```typescript
import { Controller, Get, Query } from '@midwayjs/core';

@Controller('/')
export class WeatherController {
  @Get('/weather')
  async getWeatherInfo(@Query('cityId') cityId: string): Promise<string> {
    return cityId;
  }
}
```

In addition to the `@Query` decorator, Midway also provides other request parameters. You can view the [Routing and Control](./controller) documentation.

## Write Service

In actual projects, Controller is generally used to receive request parameters and verify parameters. It does not include particularly complex logic, complex and reused logic, and we should encapsulate it as a Service file.

Let's add a Service to get weather information, including an http request to get remote data.

The code is as follows:

```typescript
// src/service/weather.service.ts
import { Provide, makeHttpRequest } from '@midwayjs/core';

@Provide()
export class WeatherService {
  async getWeather(cityId: string) {
    return makeHttpRequest('http://www.weather.com.cn/data/cityinfo/${cityId}.html', {
      dataType: 'json',
    });
  }
}
```

:::info

- 1. The `makeHttpRequest` method is Midway's built-in http request method. Please see the [document](./extensions/axios) for more parameters.
- 2. The city weather information in the example comes from the API of China Central Meteorological Station

:::

Then let's add definitions. Good type definitions can help us reduce code errors.

In the `src/interface.ts` file, we added the data definition of weather information.

```typescript
// src/interface.ts

// ...

export interface WeatherInfo {
  weatherinfo: {
    city: string;
    cityid: string;
    temp: string;
    WD: string;
    WS: string;
    SD: string;
    AP: string;
    njd: string;
    WSE: string;
    time: string;
    sm: string;
    isRadar: string;
    Radar: string;
  }
}
```

In this way, we can mark in the Service.

```typescript
import { Provide, makeHttpRequest } from '@midwayjs/core';
import { WeatherInfo } from '../interface';

@Provide
export class WeatherService {
  async getWeather(cityId: string): Promise<WeatherInfo> {
    const result = await makeHttpRequest<WeatherInfo>('http://www.weather.com.cn/data/sk/${cityId}.html', {
      dataType: 'json',
    });

    if (result.status === 200) {
      return result.data as WeatherInfo;;
    }
  }
}

```

:::info

- 1. The `@Provide` decorator is used here to modify the class, which is convenient for subsequent Controller injection.

:::



At the same time, we revised the previous Controller file.

```typescript
import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { WeatherInfo } from '../interface';
import { WeatherService } from '../service/weather.service';

@Controller('/')
export class WeatherController {

  @Inject()
  weatherService: WeatherService;

  @Get('/weather')
  async getWeatherInfo(@Query('cityId') cityId: string): Promise<WeatherInfo> {
    return this.weatherService.getWeather(cityId);
  }
}
```

:::info

- 1. The `@Inject` decorator is used here to inject `WeatherService`, which is the standard usage of Midway dependency injection. You can see [here](./service) for more information.
- 2. The return value type of the method is also modified synchronously here.

:::

At this point, we can request `http://127.0.0.1:7001/weather?cityId=101010100` to view the returned results.

Your first Midway interface has been developed. You can call it directly in the front-end code. Next, we will use this interface to complete a server-side rendered page.



## Template rendering

From here on, we need to use some Midway's expansion capabilities.

The expansion package corresponding to Midway is called "component" and is also a standard npm package.

We need to use the `@midwayjs/view-nunjucks` component here.

You can install it using the following command.

```bash
$ npm i @midwayjs/view-nunjucks --save
```

After the installation is complete, we enable the components in the `src/configuration.ts` file.

```typescript
// ...
import * as view from '@midwayjs/view-nunjucks';

@Configuration({
  imports: [
    koa,
    // ...
    view
  ],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  // ...
}

```

:::info

- 1. The `configuration` file is the life cycle entry file of Midway, which plays the role of component switch, configuration loading and life cycle management.
- 2. `imports` use the method to import (open) components

:::

Configure components in `src/config/config.default.ts` and specify them as `nunjucks` templates.

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  // ...
  view: {
    defaultViewEngine: 'nunjucks',
  },
} as MidwayConfig;

```

Add the `view/info.html` template to the root directory (not in src). The content is as follows:

```html
<! DOCTYPE html>
<html>
  <head>
    <title> weather forecast </title>
		<style>
      .weather_bg {
        background-color: #0d68bc;
        height: 150px;
        color: #fff;
        font-size: 12px;
        line-height: 1em;
        text-align: center;
        padding: 10px;
      }

      .weather_bg label {
        line-height: 1.5em;
        text-align: center;
        text-shadow: 1px 1px 1px #555;
        background: #afdb00;
        width: 100px;
        display: inline-block;
        margin-left: 10px;
      }

      .weather_bg .temp {
        font-size: 32px;
        margin-top: 5px;
        padding-left: 14px;
      }
      .weather_bg sup {
        font-size: 0.5em;
      }
    </style>
  </head>
  <body>
    <div class="weather_bg">
      <div>
        <p>
          {{city}}({{WD}}{{WS}})
        </p>
        <p class="temp">{{temp}}<sup>℃</sup></p>
        <p>
          Air pressure <label >{{ AP }}</label>
        </p>
        <p>
          Humidity <label >{{ SD }}</label>
        </p>
      </div>
    </div>
  </body>
</html>

```

At the same time, we adjust the Controller code and change the returned JSON into template rendering.

```typescript
// src/controller/weather.controller.ts
import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { WeatherService } from '../service/weather.service';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class WeatherController {

  @Inject()
  weatherService: WeatherService;

  @Inject()
  ctx: Context;

  @Get('/weather')
  async getWeatherInfo(@Query('cityId') cityId: string): Promise<void> {
    const result = await this.weatherService.getWeather(cityId);
    if (result) {
      await this.ctx.render('info', result.weatherinfo);
    }
  }
}
```

In this step, we visit `http:// 127.0.0.1:7001/weather?cityId = 101010100` The rendered template content can already be seen.



## Error handling

Don't forget, we still have some exception logic to handle.

Generally speaking, each external call needs to be caught by exception, and the exception will be turned into an error of our own business, so as to have a better experience.

To do this, we need to define a business error of our own, creating a `src/error/weather.error.ts` file.

```typescript
// src/error/weather.error.ts
import { MidwayError } from '@midwayjs/core';

export class WeatherEmptyDataError extends MidwayError {
  constructor(err?: Error) {
    super('weather data is empty', {
      cause: err
    });
    if (err?.stack) {
      this.stack = err.stack;
    }
  }
}
```

Then, we adjust the Service code to throw an exception.

```typescript
// src/service/weather.service.ts
import { Provide, makeHttpRequest } from '@midwayjs/core';
import { WeatherInfo } from '../interface';
import { WeatherEmptyDataError } from '../error/weather.error';

@Provide()
export class WeatherService {
  async getWeather(cityId: string): Promise<WeatherInfo> {
    if (! cityId) {
      throw new WeatherEmptyDataError();
    }

    try {
      const result = await makeHttpRequest<WeatherInfo>('http://www.weather.com.cn/data/sk/${cityId}.html', {
        dataType: 'json',
      });
      if (result.status === 200) {
        return result.data as WeatherInfo;
      }
    } catch (error) {
      throw new WeatherEmptyDataError(error);
    }
  }
}
```

:::info

- 1. Error capture of http call request, package the error and return a business error of our system
- 2. If necessary, we can define more errors, assign wrong Code, etc.

:::

At this stage, we also need to handle exceptions for business. For example, when multiple locations throw `WeatherEmptyDataError`, we need to return them in a unified format.

The error handler can complete this function. We need to create a `src/filter/weather.filter.ts` file with the following contents:

```typescript
//src/filter/weather.filter.ts
import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { WeatherEmptyDataError } from '../error/weather.error';

@Catch(WeatherEmptyDataError)
export class WeatherErrorFilter {
  async catch(err: WeatherEmptyDataError, ctx: Context) {
    ctx.logger.error(err);
    return '<html><body><h1>weather data is empty</h1></body></html>';
  }
}

```

It is then applied to the current framework.

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { WeatherErrorFilter } from './filter/weather.filter';
// ...

@Configuration({
  // ...
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // ...

    // add filter
    this.app.useFilter([WeatherErrorFilter]);
  }
}
```

In this way, when `WeatherEmptyDataError` error is obtained in each request, the same return value will be used to return to the browser, and the original error message will be recorded in the log.

For more information about exception handling, see [Document](./error_filter).



## Data Simulation

When writing code, our interface is often still in the unusable stage. In order to minimize the impact, we can use simulated data instead.

For example, our weather interface can be simulated locally and in the test environment.

We need to create a `src/mock/data.mock.ts` file with the following content:

```typescript
// src/mock/data.mock.ts
import {
   Mock,
   ISimulation,
   apps,
   Inject,
   IMidwayApplication,
   MidwayMockService,
} from '@midwayjs/core';
import { WeatherService } from '../service/weather.service';

@Mock()
export class WeatherDataMock implements ISimulation {
   @App()
   app: IMidwayApplication;

   @Inject()
   mockService: MidwayMockService;

   async setup(): Promise<void> {
     const originMethod = WeatherService.prototype.getWeather;
     this.mockService.mockClassProperty(
       WeatherService,
       'getWeather',
       async cityId => {
         if (cityId === '101010100') {
           return {
             weatherinfo: {
               city: 'Beijing',
               cityid: '101010100',
               temp: '27.9',
               WD: 'South Wind',
               WS: 'Less than level 3',
               SD: '28%',
               AP: '1002hPa',
               njd: 'No live broadcast yet',
               WSE: '<3',
               time: '17:55',
               sm: '2.1',
               isRadar: '1',
               Radar: 'JC_RADAR_AZ9010_JB',
             },
           };
         } else {
           return originMethod.apply(this, [cityId]);
         }
       }
     );
   }

   enableCondition(): boolean | Promise<boolean> {
     // Conditions for the mock class to be enabled
     return ['local', 'test', 'unittest']. includes(this. app. getEnv());
   }
}

```

The `WeatherDataMock` class is used to simulate weather data, and the `setup` method is used for the actual initialization simulation. Among them, we use the `mockClassProperty` method of the built-in `MidwayMockService` to simulate the `getWeather` method of `WeatherService` Lose.

In the simulation process, we only processed the data of a single city, and the others still followed the original interface.

`enableCondition` is used to identify the scenarios in which this mock class takes effect. For example, the code above only takes effect locally and in the test environment.

In this way, when developing and testing locally, the data we request `101010100` will be intercepted and returned directly, and will not be affected after deployment to the server environment.

There are more interfaces available for data mocking, please refer to [documentation](./mock).

## Unit test

By default, Midway uses jest as the basic test framework. Generally, our test files are placed in the `test` directory of the root directory, with the `*.test.ts` suffix.

For example, we will test the written `/weather` interface.

We need to test its success and failure.

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/koa';

describe('test/controller/weather.test.ts', () => {

  let app: Application;
  beforeAll(async () => {
    // create app
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    // close app
    await close(app);
  });

  it('should test /weather with success request', async () => {
    // make request
    const result = await createHttpRequest(app).get('/weather').query({ cityId: 101010100 });

    expect(result.status).toBe(200);
    Expect (result.text).toMatch(/Beijing/);
  });

  it('should test /weather with fail request', async () => {
    const result = await createHttpRequest(app).get('/weather');

    expect(result.status).toBe(200);
    expect(result.text).toMatch(/weather data is empty/);
  });
});

```

Perform tests:

```bash
$ npm run test
```

For more information, see [Test](./testing).

:::info

- 1. During jest test, use a single file as a unit and use `beforeAll` and `afterAll` to control the start and stop of app
- 2. Use `createHttpRequest` to create a test request
- 3. Use expect to assert whether the returned results meet expectations.

:::



## Continue to learn

Congratulations, you have some preliminary understanding of Midway. Let's review it briefly.

- 1. We use `npm init midway` to create an example.
- 2. Use the `@Controller` decorator to define routing and controller classes
- 3. Use `@Query` to obtain the request parameters.
- 4. use `@Provide` and `@Inject` to inject service classes
- 5. Use `imports` to enable components and configure nunjucks templates
- 6. Customize the error, use the error filter to intercept the error and return the custom data
- 7. Use jest to create tests and add successful and failed test cases

The above is only a small part of Midway. As the use deepens, more capabilities will be used.

You can start by [creating](./quickstart) a solution for different scenarios of the Midway. You can also go to the [Routing and Controller](./controller) section and add some request methods. You can also learn about [Web middleware](./middleware) or [dependency injection](./container).
