<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getTool } from '../composables/useData'

const route = useRoute()
const tool = computed(() => getTool(route.params.id))
const Module = computed(() => {
  const current = tool.value
  if (!current || current.status !== 'online' || !current.component) return null
  return defineAsyncComponent(current.component)
})
</script>

<template>
  <section class="view-frame">
    <p class="kicker"><span>03</span> Tool module</p>

    <article v-if="Module" class="panel module">
      <component :is="Module" />
    </article>

    <article v-else class="panel empty">
      <span class="lamp" aria-hidden="true" />
      <h1>{{ tool ? tool.name : '找不到这个工具' }}</h1>
      <p>
        {{
          tool
            ? '这个工具还没上线。内容准备好以后，去后台把状态改成「在线」就行。'
            : '仓库里没有这个编号。回工具列表重新选一个吧。'
        }}
      </p>
      <RouterLink class="back" to="/tools">← 回到工具列表</RouterLink>
    </article>
  </section>
</template>

<style scoped>
.module,
.empty {
  padding: clamp(1.4rem, 4vw, 2.4rem);
  min-height: 280px;
}
.empty {
  max-width: 640px;
}
.lamp {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--warm);
  margin-bottom: 1.4rem;
}
h1 {
  margin: 0 0 0.8rem;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 650;
}
p {
  margin: 0;
  max-width: 46ch;
  opacity: 0.75;
  line-height: 1.65;
}
.back {
  display: inline-block;
  margin-top: 1.8rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ice);
  border-bottom: 1px solid transparent;
  padding-bottom: 0.1rem;
}
.back:hover {
  color: var(--ice-bright);
  border-bottom-color: var(--ice);
}
</style>
