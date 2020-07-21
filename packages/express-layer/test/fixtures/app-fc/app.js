const express = require('express');
// const expressBodyParser = require('body-parser');
const app = express.createServer();

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});

// this.app.use(expressBodyParser.urlencoded({ extended: false }));
// this.app.use(expressBodyParser.json());

router.get('/get', (res, res) => {
  res.type = 'html';
  res.send('Hello World');
});

router.get('/get/query', (res, res) => {
  res.send({
    query: ctx.query
  });
});

router.post('/post', (res, res) => {
  res.send('Hello World, post');
});

router.post('/post/body', (res, res) => {
  res.send({
    body: res.body
  });
});

// app.listen(3000);

module.exports = app;
