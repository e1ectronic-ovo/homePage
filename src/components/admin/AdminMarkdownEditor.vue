<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import 'md-editor-v3/lib/style.css'

const MdEditor = defineAsyncComponent(() =>
  import('md-editor-v3').then((m) => m.MdEditor)
)

const props = defineProps({
  modelValue: { type: String, default: '' },
  editorId: { type: String, required: true },
  placeholder: { type: String, default: '支持 Markdown…' },
})

const emit = defineEmits(['update:modelValue'])

const isMobile = ref(false)
let media = null

function onMediaChange(e) {
  isMobile.value = e.matches
}

onMounted(() => {
  media = window.matchMedia('(max-width: 720px)')
  isMobile.value = media.matches
  media.addEventListener('change', onMediaChange)
})

onUnmounted(() => {
  if (media) media.removeEventListener('change', onMediaChange)
})

const editorHeight = computed(() =>
  isMobile.value ? 'min(360px, 50vh)' : 'min(520px, 58vh)'
)

const toolbarsExclude = computed(() =>
  isMobile.value
    ? ['github', 'mermaid', 'katex', 'catalog', 'htmlPreview', 'pageFullscreen']
    : ['github', 'mermaid', 'katex']
)
</script>

<template>
  <div class="md-editor-wrap">
    <MdEditor
      :id="editorId"
      :modelValue="modelValue"
      :placeholder="placeholder"
      theme="dark"
      previewTheme="github"
      language="zh-CN"
      :toolbarsExclude="toolbarsExclude"
      :style="{ height: editorHeight }"
      @update:modelValue="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.md-editor-wrap {
  width: 100%;
  min-width: 0;
}

.md-editor-wrap :deep(.md-editor) {
  --md-bk-color: rgba(10, 14, 18, 0.72);
  --md-bk-color-outstand: rgba(10, 14, 18, 0.9);
  --md-bk-hover-color: rgba(127, 158, 168, 0.14);
  --md-border-color: var(--line);
  --md-color: var(--mist);
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 2px);
  font-family: var(--font-body);
}

.md-editor-wrap :deep(.cm-editor),
.md-editor-wrap :deep(.cm-scroller) {
  font-family: var(--font-mono);
  font-size: 0.88rem;
}

.md-editor-wrap :deep(.md-editor-toolbar-wrapper) {
  border-bottom: 1px solid var(--line);
}

@media (max-width: 720px) {
  .md-editor-wrap :deep(.md-editor-toolbar-wrapper) {
    overflow-x: auto;
  }

  .md-editor-wrap :deep(.md-editor-toolbar) {
    flex-wrap: nowrap;
  }
}
</style>
