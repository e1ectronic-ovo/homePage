import MarkdownIt from 'markdown-it'
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import markdownItTaskLists from 'markdown-it-task-lists'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})
  .use(markdownItSub)
  .use(markdownItSup)
  .use(markdownItTaskLists, { enabled: true })

const defaultLinkOpen =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const href = tokens[idx].attrGet('href')
  if (href && /^https?:/i.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

const defaultTableOpen =
  md.renderer.rules.table_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }
const defaultTableClose =
  md.renderer.rules.table_close ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
  return '<div class="md-table-wrap">' + defaultTableOpen(tokens, idx, options, env, self)
}

md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
  return defaultTableClose(tokens, idx, options, env, self) + '</div>\n'
}

/**
 * Markdown 渲染（与后台 md-editor 使用同一套 markdown-it 能力）
 */
export function renderMarkdown(source = '') {
  if (!source) return ''
  return md.render(source)
}
