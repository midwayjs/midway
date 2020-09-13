{% extends "../layout/layout.tpl" %}

{% block content %}
  <div class="item-view view v-transition">
    <!-- item detail -->
    {% include "./item.tpl" %}
    <!-- comments -->
    {% if comments.length > 0%}
      <ul class="comments">
        {% for comment in comments %}
          <li>
            <div class="comhead">
              <a class="toggle">[-]</a>
              <a href="/news/user/{{ comment.by }}">{{ comment.by }}</a>
              {{ comment.time | relativeTime }}
            </div>
            <div class="comment-content">
              {{ helper.shtml(comment.text) }}
            </div>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p>No comments yet.</p>
    {% endif %}
  </div>
{% endblock %}
