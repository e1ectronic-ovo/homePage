<script setup>
import { RouterLink } from 'vue-router'
import { kids } from '../composables/useData'

const statusMap = {
  online: { label: '可以看', cls: 'online' },
  planning: { label: '准备中', cls: 'planning' },
  offline: { label: '未上线', cls: 'offline' },
}
</script>

<template>
  <section class="view-frame">
    <p class="kicker"><span>05</span> Kids</p>
    <div class="intro">
      <h1>给孩子留的小角落。</h1>
      <p>
        颜色、数字、简单的世界——希望有一天他能在这里点来点去，慢慢认识一些东西。
        目前大多在准备中，内容会慢慢补。
      </p>
    </div>

    <div class="bento">
      <component
        :is="item.status === 'online' ? RouterLink : 'div'"
        v-for="item in kids"
        :key="item.id"
        class="panel cell"
        :class="item.status"
        :to="item.status === 'online' ? `/kids/${item.id}` : undefined"
      >
        <header>
          <span class="age-tag">Age {{ item.age }}</span>
          <span class="state" :class="statusMap[item.status]?.cls">
            {{ statusMap[item.status]?.label || item.status }}
          </span>
        </header>
        <h2>{{ item.title }}</h2>
        <p>{{ item.blurb }}</p>
        <span v-if="item.status === 'online'" class="go">进入 →</span>
        <span v-else class="go muted">还在准备</span>
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
  max-width: 16ch;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}
.cell {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 1.25rem 1.3rem 1.15rem;
  transition: transform 0.3s var(--ease), border-color 0.3s var(--ease);
}
a.cell:hover {
  transform: translateY(-3px);
  border-color: var(--line-strong);
}
.cell.planning,
.cell.offline {
  opacity: 0.8;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
}
.age-tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  padding: 0.22rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ice);
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
  font-size: 1.4rem;
  font-weight: 650;
}
.cell p {
  margin: 0;
  opacity: 0.7;
  max-width: 36ch;
  line-height: 1.6;
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
@media (max-width: 760px) {
  .intro,
  .bento {
    grid-template-columns: 1fr;
  }
}
</style>
