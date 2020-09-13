<div class="item">
  <span class="index">{{ index }}.</span>
  <p>
    <a class="title" target="_blank" href="{{ item.url }}">{{ helper.shtml(item.title) }}</a>
    <span class="domain">({{ item.url | domain }})</span>
  </p>
  <p class="subtext">
    <span>
      {{ item.score }} points by <a href="/news/user/{{ item.by }}">{{ item.by }}</a>
    </span>
    {{ item.time | relativeTime }}
    <span class="comments-link">
      | <a href="/news/item/{{ item.id }}">{{ item.descendants }} comments</a>
    </span>
  </p>
</div>