<script setup>
import { computed, defineAsyncComponent, shallowRef, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getKid } from '../composables/useData'
import { renderMarkdown } from '../composables/useMarkdown'
import { hasKidModule, kidModules } from '../components/kids/registry'

const route = useRoute()
const kid = computed(() => getKid(route.params.id))
const html = computed(() => renderMarkdown(kid.value?.content))
const kidModule = shallowRef(null)

watch(
  kid,
  async (item) => {
    if (!item || item.status !== 'online') {
      kidModule.value = null
      return
    }
    let loader = null
    if (item.kind === 'stories' || Array.isArray(item.stories)) {
      loader = kidModules.stories
    } else if (item.kind === 'letter' || item.letter) {
      loader = kidModules['first-letter']
    } else if (hasKidModule(item.id)) {
      loader = kidModules[item.id]
    }
    if (!loader) {
      kidModule.value = null
      return
    }
    try {
      const mod = await loader()
      kidModule.value = mod.default
    } catch {
      kidModule.value = null
    }
  },
  { immediate: true }
)
</script>

<template>
  <section class="view-frame kid">
    <RouterLink to="/kids" class="back">← 回到 Kids 列表</RouterLink>

    <article v-if="kid">
      <header class="hd">
        <p class="kicker"><span>{{ kid.age }}</span> Kids</p>
        <h1>{{ kid.title }}</h1>
        <p v-if="kid.blurb" class="lead">{{ kid.blurb }}</p>
      </header>

      <component v-if="kidModule" :is="kidModule" :kid="kid" class="kid-stage" />
      <div v-else class="body md" v-html="html"></div>
    </article>

    <div v-else class="empty panel">
      <p>还没有这份内容。</p>
      <RouterLink to="/kids">回 Kids 列表看看</RouterLink>
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
}
.back:hover {
  color: var(--ice-bright);
  border-bottom-color: var(--ice);
}
.hd {
  margin-bottom: 1.6rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--line);
}
h1 {
  margin: 0.8rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.lead {
  margin: 0.75rem 0 0;
  max-width: 42ch;
  font-size: 1rem;
  line-height: 1.65;
  opacity: 0.78;
}
.kid-stage {
  max-width: 36rem;
}
.body {
  max-width: 68ch;
  font-size: 1.04rem;
  line-height: 1.8;
}
.body :deep(h1),
.body :deep(h2),
.body :deep(h3) {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  margin: 1.8em 0 0.6em;
}
.body :deep(p) {
  margin: 0 0 1.2rem;
  color: rgba(200, 214, 220, 0.9);
}
.body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  background: rgba(127, 158, 168, 0.12);
  border-radius: 3px;
}
.body :deep(pre) {
  padding: 1rem;
  background: rgba(10, 14, 18, 0.6);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
}
.body :deep(a) {
  color: var(--ice-bright);
  border-bottom: 1px solid rgba(127, 190, 210, 0.4);
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
    font-size: clamp(1.65rem, 7vw, 2.2rem);
  }

  .body {
    font-size: 1rem;
  }

  .kid-stage {
    max-width: none;
  }
}
</style>
