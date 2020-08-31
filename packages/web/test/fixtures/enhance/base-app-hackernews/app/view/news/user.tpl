{% extends "../layout/layout.tpl" %}
{% block title %}
  Profile: {{ user.id }} | egg - HackerNews
{% endblock %}
{% block content %}
  <div class="user-view view v-transition">
    <ul>
      <li><span class="label">user:</span> {{ user.id }}</li>
      <li><span class="label">created:</span> {{ user.created | relativeTime }}</li>
      <li><span class="label">karma:</span> {{ user.karma }}</li>
      <li>
        <span class="label">about:</span>
        <div class="about">
          {{ helper.shtml(user.about) }}
        </div>
      </li>
    </ul>
    <p class="links">
      <a href="https://news.ycombinator.com/submitted?id={{ user.id }}">submissions</a><br>
      <a href="https://news.ycombinator.com/threads?id={{ user.id }}">comments</a>
    </p>
  </div>
{% endblock %}