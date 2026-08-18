<script setup>
import { projects } from '../composables/useData'
</script>

<template>
  <section class="view-frame">
    <p class="kicker"><span>02</span> Projects</p>
    <h1>做过的、在做的、和打算做的。</h1>

    <ul class="list">
      <li v-for="project in projects" :key="project.name">
        <component
          :is="project.href ? 'a' : 'div'"
          class="row"
          :href="project.href || undefined"
          :target="project.href && project.href.startsWith('http') ? '_blank' : undefined"
          :rel="project.href && project.href.startsWith('http') ? 'noreferrer' : undefined"
        >
          <span class="year">{{ project.year }}</span>
          <span class="main">
            <strong>{{ project.name }}</strong>
            <em>{{ project.blurb }}</em>
          </span>
          <span class="meta">
            <span class="status" :class="project.status">{{
              { online: '在线', offline: '未上线', planning: '计划中' }[project.status] || project.status
            }}</span>
            <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
          </span>
        </component>
      </li>
    </ul>
  </section>
</template>

<style scoped>
h1 {
  margin: 0 0 2.4rem;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 650;
  letter-spacing: -0.03em;
  max-width: 18ch;
  line-height: 1.15;
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
  grid-template-columns: 5.5rem 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding: 1.35rem 0.2rem;
  border-bottom: 1px solid var(--line);
  transition: background 0.3s var(--ease), transform 0.3s var(--ease);
}
a.row:hover {
  background: rgba(255, 255, 255, 0.02);
  transform: translateX(4px);
}
.year {
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
  max-width: 52ch;
  opacity: 0.72;
  line-height: 1.65;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
  padding-top: 0.3rem;
}
.status,
.tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.22rem 0.45rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.status.online {
  color: var(--ice-bright);
  border-color: rgba(127, 158, 168, 0.45);
}
.status.offline {
  color: var(--warm);
  opacity: 0.85;
}
.status.planning {
  color: var(--ice);
  opacity: 0.85;
}
@media (max-width: 760px) {
  .row {
    grid-template-columns: 3.6rem 1fr;
  }
  .meta {
    grid-column: 2;
    justify-content: flex-start;
  }
}
</style>
