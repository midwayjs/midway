{% extends "../layout/layout.tpl" %}

{% block content %}
  <div class="news-view view v-transition">
    {% for item in list %}
      {% set index = ((page-1) * pageSize + loop.index) %}
      {% include "./item.tpl" %}
    {% endfor %}

    <div class="nav">
      {% if page > 1 %}
        <a href="/news?page={{ page - 1 }}">&lt; prev</a>
      {% endif %}
        <a href="/news?page={{ page + 1 }}">more...</a>
    </div>
  </div>
{% endblock %}