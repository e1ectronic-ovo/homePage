<script setup>
import { computed, ref, watch } from 'vue'
import { renderMarkdown } from '../../composables/useMarkdown'

const props = defineProps({
  kid: { type: Object, required: true },
})

const stories = computed(() => props.kid?.stories ?? [])
const index = ref(0)

watch(stories, () => {
  index.value = 0
})

const current = computed(() => stories.value[index.value] ?? { title: '', text: '' })
const currentHtml = computed(() => renderMarkdown(current.value.text))

function prev() {
  if (!stories.value.length) return
  index.value = (index.value - 1 + stories.value.length) % stories.value.length
}
function next() {
  if (!stories.value.length) return
  index.value = (index.value + 1) % stories.value.length
}
</script>

<template>
  <div class="play prenatal-stories">
    <p class="hint">放慢语速，轻轻读。不用演，就像在身边说话。</p>

    <div v-if="stories.length" class="card panel">
      <h2 class="card-title">{{ current.title }}</h2>
      <div class="card-body md" v-html="currentHtml"></div>
    </div>
    <div v-else class="empty panel muted">还没有故事，去后台添加吧。</div>

    <div v-if="stories.length > 1" class="nav">
      <button type="button" class="btn btn-ghost" @click="prev">← 上一个</button>
      <span class="count">{{ index + 1 }} / {{ stories.length }}</span>
      <button type="button" class="btn btn-ghost" @click="next">下一个 →</button>
    </div>
  </div>
</template>

<style scoped>
.prenatal-stories {
  display: grid;
  gap: 1rem;
}
.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.92rem;
  line-height: 1.6;
}
.card {
  padding: 1.5rem 1.35rem;
}
.card-title {
  margin: 0 0 1.1rem;
  font-family: var(--font-display);
  font-size: clamp(1.45rem, 3.4vw, 1.85rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: rgba(235, 242, 246, 0.96);
}
.card-body {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 2.6vw, 1.28rem);
  line-height: 1.85;
  letter-spacing: 0.02em;
}
.card-body :deep(p) {
  margin: 0 0 1.1rem;
  color: rgba(220, 228, 232, 0.92);
}
.card-body :deep(p:last-child) {
  margin-bottom: 0;
}
.card-body :deep(strong) {
  color: rgba(235, 242, 246, 0.96);
}
.card-body :deep(em) {
  font-style: italic;
  opacity: 0.92;
}
.card-body :deep(ul),
.card-body :deep(ol) {
  margin: 0 0 1.1rem;
  padding-left: 1.35rem;
}
.card-body :deep(li) {
  margin: 0.25rem 0;
  color: rgba(220, 228, 232, 0.92);
}
.card-body :deep(blockquote) {
  margin: 1.1rem 0;
  padding: 0.5rem 0.9rem;
  border-left: 2px solid var(--ice);
  background: rgba(255, 255, 255, 0.02);
  color: rgba(220, 228, 232, 0.88);
  font-style: italic;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  opacity: 0.55;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.02);
  color: var(--mist);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  min-height: var(--touch);
}
.btn:hover {
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.04);
}
.empty {
  padding: 1.4rem;
  text-align: center;
}
@media (max-width: 720px) {
  .nav {
    flex-direction: column;
    align-items: stretch;
  }
  .count {
    text-align: center;
  }
  .btn {
    justify-content: center;
  }
}
</style>
