<script setup>
import { computed } from 'vue'

const props = defineProps({
  kid: { type: Object, required: true },
})

const salute = computed(() => props.kid?.letter?.salute ?? '')
const paragraphs = computed(() => props.kid?.letter?.paragraphs ?? [])
const sign = computed(() => props.kid?.letter?.sign ?? '')
</script>

<template>
  <div class="play first-letter">
    <p class="hint">可以轻声读出来，也可以在心里说。</p>

    <div v-if="salute || paragraphs.length" class="letter panel">
      <p v-if="salute" class="salute">{{ salute }}</p>
      <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
      <p v-if="sign" class="sign">{{ sign }}</p>
    </div>
    <div v-else class="empty panel muted">还没有内容，去后台编辑这封信吧。</div>
  </div>
</template>

<style scoped>
.first-letter {
  display: grid;
  gap: 1rem;
  max-width: 40rem;
}
.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.92rem;
}
.letter {
  padding: 1.5rem 1.35rem;
}
.letter p {
  margin: 0 0 1.1rem;
  font-size: 1.05rem;
  line-height: 1.85;
  color: rgba(200, 214, 220, 0.9);
}
.salute {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 3.5vw, 1.75rem);
  font-weight: 650;
  letter-spacing: 0.04em;
  color: var(--mist);
  margin-bottom: 1.25rem;
}
.sign {
  margin-top: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  opacity: 0.7;
}
.empty {
  padding: 1.4rem;
  text-align: center;
}
</style>
