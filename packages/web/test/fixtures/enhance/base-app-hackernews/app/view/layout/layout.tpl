<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
    <link rel="stylesheet" href="/public/css/news.css" />
    <link rel="icon" href="/public/favicon.png" type="image/x-icon">
    <title>{% block title %}egg - HackerNews{% endblock %}</title>
  </head>
  <body>
    <div id="wrapper">
      <div id="header">
        <a id="yc" href="http://www.ycombinator.com"><img src="https://news.ycombinator.com/y18.gif"></a>
        <h1><a href="/news">Hacker News</a></h1>
        <span class="source">
          Built with <a href="https://eggjs.org/" target="_blank">egg</a> | <a href="https://github.com/eggjs/egg-boilerplate-simple" target="_blank">Source</a>
        </span>
      </div>
      {% block content %}{% endblock %}
    </div>
  </body>
</html>
