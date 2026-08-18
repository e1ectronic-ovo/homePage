<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPost } from '../composables/useData'
import { renderMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const post = computed(() => getPost(route.params.id))
const html = computed(() => renderMarkdown(post.value?.content))

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(day)} 日`
}
</script>

<template>
  <section class="view-frame post">
    <RouterLink to="/blog" class="back">← 回到博客列表</RouterLink>

    <article v-if="post">
      <header class="hd">
        <p class="kicker"><span>{{ formatDate(post.date) }}</span> Article</p>
        <h1>{{ post.title }}</h1>
        <div class="meta">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>

      <div class="body md" v-html="html"></div>
    </article>

    <div v-else class="empty panel">
      <p>找不到这篇文章。</p>
      <RouterLink to="/blog">回博客列表看看</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--ice);
  opacity: 0.8;
  margin-bottom: 1.6rem;
  border-bottom: 1px solid transparent;
  padding-bottom: 0.1rem;
  transition: border-color 0.2s var(--ease), color 0.2s var(--ease);
}
.back:hover {
  color: var(--ice-bright);
  border-bottom-color: var(--ice);
}
.hd {
  margin-bottom: 2.4rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--line);
}
h1 {
  margin: 0.8rem 0 1.2rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  max-width: 28ch;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.22rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.body {
  max-width: 68ch;
  font-size: 1.02rem;
  line-height: 1.8;
}
.body :deep(h1),
.body :deep(h2),
.body :deep(h3),
.body :deep(h4) {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  margin: 2em 0 0.8em;
  line-height: 1.3;
}
.body :deep(h2) {
  font-size: 1.45rem;
  font-weight: 700;
}
.body :deep(h3) {
  font-size: 1.18rem;
  font-weight: 650;
}
.body :deep(p) {
  margin: 0 0 1.2rem;
  color: rgba(200, 214, 220, 0.9);
}
.body :deep(ul),
.body :deep(ol) {
  margin: 0 0 1.2rem;
  padding-left: 1.4rem;
}
.body :deep(li) {
  margin: 0.2rem 0;
  color: rgba(200, 214, 220, 0.9);
}
.body :deep(blockquote) {
  margin: 1.4rem 0;
  padding: 0.6rem 1rem;
  border-left: 2px solid var(--ice);
  background: rgba(255, 255, 255, 0.02);
  color: rgba(200, 214, 220, 0.85);
  font-style: italic;
}
.body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  background: rgba(127, 158, 168, 0.12);
  border-radius: 3px;
  color: var(--ice-bright);
}
.body :deep(pre) {
  margin: 1.4rem 0;
  padding: 1rem 1.2rem;
  background: rgba(10, 14, 18, 0.6);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
}
.body :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--mist);
}
.body :deep(a) {
  color: var(--ice-bright);
  border-bottom: 1px solid rgba(127, 190, 210, 0.4);
  transition: border-color 0.2s var(--ease);
}
.body :deep(a:hover) {
  border-bottom-color: var(--ice-bright);
}
.empty {
  padding: 2rem;
  opacity: 0.85;
}
.empty p {
  margin: 0 0 1rem;
}

@media (max-width: 720px) {
  h1 {
    max-width: none;
    font-size: clamp(1.65rem, 7vw, 2.4rem);
  }

  .body {
    font-size: 1rem;
    line-height: 1.75;
  }
}
</style>
