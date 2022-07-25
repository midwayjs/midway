const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/get', (req, res) => {
  res.type('html')
  res.send('Hello World');
});

app.get('/get/query', (req, res) => {
  res.send({
    query: req.query
  });
});

app.post('/post', (req, res) => {
  res.send('Hello World, post');
});

app.post('/post/body', (req, res) => {
  res.send({
    body: req.body
  });
});

app.get('/get_ip', (req, res) => {
  res.type('text')
  res.send('ip=' + req.ip);
});

// app.listen(3000);

module.exports = app;
