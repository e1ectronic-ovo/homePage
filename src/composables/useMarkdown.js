/**
 * 极简 Markdown 渲染器（够用就行，避免依赖）
 * 支持：# 标题、段落、换行、- 无序列表、1. 有序列表、**粗体**、*斜体*、`code`、```代码块```、[链接](url)、> 引用
 */
export function renderMarkdown(md = '') {
  if (!md) return ''
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let inCode = false
  let codeLang = ''
  let codeBuf = []
  let inList = null // 'ul' | 'ol' | null
  let inQuote = false
  let paragraphBuf = []

  function flushParagraph() {
    if (!paragraphBuf.length) return
    out.push('<p>' + inline(paragraphBuf.join(' ')) + '</p>')
    paragraphBuf = []
  }
  function flushList() {
    if (!inList) return
    out.push(inList === 'ul' ? '</ul>' : '</ol>')
    inList = null
  }
  function flushQuote() {
    if (!inQuote) return
    flushParagraph()
    out.push('</blockquote>')
    inQuote = false
  }
  function flushCode() {
    if (!inCode) return
    out.push('<pre><code class="lang-' + escapeHtml(codeLang) + '">' + escapeHtml(codeBuf.join('\n')) + '</code></pre>')
    inCode = false
    codeLang = ''
    codeBuf = []
  }

  for (const raw of lines) {
    const line = raw
    // 代码块
    if (line.startsWith('```')) {
      flushParagraph()
      flushList()
      flushQuote()
      if (inCode) {
        flushCode()
      } else {
        inCode = true
        codeLang = line.slice(3).trim()
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }
    // 标题
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushParagraph()
      flushList()
      flushQuote()
      const level = h[1].length
      out.push('<h' + level + '>' + inline(h[2]) + '</h' + level + '>')
      continue
    }
    // 引用
    if (line.startsWith('> ')) {
      flushParagraph()
      flushList()
      if (!inQuote) {
        inQuote = true
        out.push('<blockquote>')
      }
      paragraphBuf.push(line.slice(2))
      continue
    } else {
      flushQuote()
    }
    // 无序列表
    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph()
      flushQuote()
      if (inList !== 'ul') {
        flushList()
        inList = 'ul'
        out.push('<ul>')
      }
      out.push('<li>' + inline(line.replace(/^\s*[-*+]\s+/, '')) + '</li>')
      continue
    }
    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph()
      flushQuote()
      if (inList !== 'ol') {
        flushList()
        inList = 'ol'
        out.push('<ol>')
      }
      out.push('<li>' + inline(line.replace(/^\s*\d+\.\s+/, '')) + '</li>')
      continue
    }
    // 空行
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      continue
    }
    // 段落行
    flushList()
    paragraphBuf.push(line)
  }
  flushParagraph()
  flushList()
  flushQuote()
  flushCode()

  return out.join('\n')
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const u = escapeAttr(url)
      const external = /^https?:/.test(u)
      return external
        ? '<a href="' + u + '" target="_blank" rel="noreferrer">' + text + '</a>'
        : '<a href="' + u + '">' + text + '</a>'
    })
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;')
}
