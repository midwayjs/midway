import { Provide, Controller, Get } from '@midwayjs/decorator';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import App from '../../shared/App';

@Provide()
@Controller('/')
export class My {
  @Get('/')
  async index(ctx) {
    ctx.body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>SSR Test</title>
</head>
<body>
    <div id="app">${ReactDOM.renderToString(<App />)}</div>
</body>
</html>
`;
  }
}
