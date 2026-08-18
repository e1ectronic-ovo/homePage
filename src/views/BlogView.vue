<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { posts } from '../composables/useData'

const sorted = computed(() =>
  [...posts.value].sort((a, b) => (a.date < b.date ? 1 : -1))
)

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${y}.${m}.${day}`
}
</script>

<template>
  <section class="view-frame">
    <p class="kicker"><span>04</span> Blog</p>
    <div class="intro">
      <h1>想法、笔记，和一些记录。</h1>
      <p>想到什么写什么，不一定有营养，但一定是当时真实想过的。</p>
    </div>

    <ul v-if="sorted.length" class="list">
      <li v-for="post in sorted" :key="post.id">
        <RouterLink class="row" :to="`/blog/${post.id}`">
          <span class="date">{{ formatDate(post.date) }}</span>
          <span class="main">
            <strong>{{ post.title }}</strong>
            <em>{{ post.excerpt }}</em>
          </span>
          <span class="meta">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
    <div v-else class="empty panel">还没有文章。去后台写一篇吧。</div>
  </section>
</template>

<style scoped>
.intro {
  display: grid;
  grid-template-columns: 1fr 0.7fr;
  gap: 2rem;
  align-items: end;
  margin-bottom: 2.2rem;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 650;
  letter-spacing: -0.03em;
  max-width: 18ch;
  line-height: 1.15;
}
.intro p {
  margin: 0;
  max-width: 42ch;
  opacity: 0.72;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid var(--line);
}
.row {
  display: grid;
  grid-template-columns: 6.2rem 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding: 1.35rem 0.2rem;
  border-bottom: 1px solid var(--line);
  transition: background 0.3s var(--ease), transform 0.3s var(--ease);
}
.row:hover {
  background: rgba(255, 255, 255, 0.02);
  transform: translateX(4px);
}
.date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--warm);
  padding-top: 0.35rem;
}
.main {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.main strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
}
.main em {
  font-style: normal;
  max-width: 56ch;
  opacity: 0.7;
  line-height: 1.6;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
  padding-top: 0.3rem;
}
.tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.22rem 0.45rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.empty {
  padding: 2rem;
  opacity: 0.75;
}
@media (max-width: 760px) {
  .intro {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .row {
    grid-template-columns: 4rem 1fr;
  }
  .meta {
    grid-column: 2;
    justify-content: flex-start;
  }
}
</style>
