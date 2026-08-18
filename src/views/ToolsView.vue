<script setup>
import { tools } from '../composables/useData'
</script>

<template>
  <section class="view-frame">
    <p class="kicker"><span>03</span> Tools bay</p>
    <div class="intro">
      <h1>一些用完即走的小工具。</h1>
      <p>
        先有舱位，再慢慢填东西。在线的可以点进去，离线的是准备中的位置，等内容齐了就上线。
      </p>
    </div>

    <div class="bento">
      <component
        :is="tool.status === 'online' ? 'RouterLink' : 'div'"
        v-for="tool in tools"
        :key="tool.id"
        class="panel cell"
        :class="[tool.span, tool.status]"
        :to="tool.status === 'online' ? `/tools/${tool.id}` : undefined"
      >
        <header>
          <span class="lamp" :class="tool.status" aria-hidden="true" />
          <span class="state">{{
            { online: '在线', offline: '未上线' }[tool.status] || tool.status
          }}</span>
        </header>
        <h2>{{ tool.name }}</h2>
        <p>{{ tool.blurb }}</p>
        <span v-if="tool.status === 'online'" class="go">进入 →</span>
        <span v-else class="go muted">等后续</span>
      </component>
    </div>
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
  max-width: 14ch;
  line-height: 1.15;
}
.intro p {
  margin: 0;
  max-width: 42ch;
  opacity: 0.72;
  line-height: 1.7;
}
.bento {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 0.85rem;
}
.cell {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 1.25rem 1.3rem 1.15rem;
  transition: transform 0.3s var(--ease), border-color 0.3s var(--ease);
}
.cell.wide {
  grid-column: 1;
  grid-row: 1 / 3;
  min-height: 100%;
}
a.cell:hover {
  transform: translateY(-3px);
  border-color: var(--line-strong);
}
.cell.offline {
  opacity: 0.8;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
}
.lamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--warm);
}
.lamp.online {
  background: var(--ice-bright);
}
.state {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--warm);
}
.state.online {
  color: var(--ice-bright);
}
h2 {
  margin: auto 0 0.6rem;
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 650;
}
.cell p {
  margin: 0;
  opacity: 0.72;
  max-width: 36ch;
  line-height: 1.65;
}
.go {
  margin-top: 1.3rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ice);
}
.go.muted {
  color: var(--warm);
}
@media (max-width: 860px) {
  .intro,
  .bento {
    grid-template-columns: 1fr;
  }
  .cell.wide {
    grid-column: auto;
    grid-row: auto;
    min-height: 200px;
  }
}
</style>
