<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  profile,
  projects,
  tools,
  posts,
  kids,
  getAllData,
} from '../composables/useData'
import {
  saveAdminConfig,
  loadAdminConfig,
  clearAdminConfig,
  verifyAccess,
  writeFiles,
} from '../composables/useGithub'

/* ---------- 登录状态 ---------- */
const loggedIn = ref(false)
const loginForm = reactive({
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  apiBase: '',
})
const loginLoading = ref(false)
const loginError = ref('')

onMounted(() => {
  const saved = loadAdminConfig()
  if (saved) {
    Object.assign(loginForm, saved)
  }
})

async function doLogin() {
  loginLoading.value = true
  loginError.value = ''
  try {
    if (!loginForm.token) throw new Error('Token 不能空')
    if (!loginForm.owner || !loginForm.repo) throw new Error('Owner 和 Repo 都要填')
    await verifyAccess(loginForm)
    saveAdminConfig({ ...loginForm })
    loggedIn.value = true
  } catch (e) {
    loginError.value = e.message || '验证失败'
  } finally {
    loginLoading.value = false
  }
}
function doLogout() {
  clearAdminConfig()
  loggedIn.value = false
  loginError.value = ''
}

/* ---------- 选中的模块 tab ---------- */
const activeTab = ref('profile')

const TABS = [
  { key: 'profile', label: '个人信息', icon: '◉' },
  { key: 'projects', label: '项目列表', icon: '▣' },
  { key: 'tools', label: '工具列表', icon: '◎' },
  { key: 'posts', label: '博客文章', icon: '✎' },
  { key: 'kids', label: 'Kids 内容', icon: '❀' },
  { key: 'deploy', label: '提交 & 发布', icon: '⇧' },
]

/* ---------- Profile 编辑 ---------- */
// profile 是 ref object，直接双向绑定其字段。focus/links 数组用临时引用即可。
function addFocus() {
  profile.value.about.focus.push({ code: 'NEW', label: '新标签', note: '描述一下' })
}
function delFocus(i) {
  profile.value.about.focus.splice(i, 1)
}
function addLink() {
  profile.value.links.push({ label: '链接名', href: 'https://' })
}
function delLink(i) {
  profile.value.links.splice(i, 1)
}
function addBody() {
  profile.value.about.body.push('新段落……')
}
function delBody(i) {
  profile.value.about.body.splice(i, 1)
}

/* ---------- Projects CRUD ---------- */
function addProject() {
  projects.value.unshift({
    name: '新项目',
    year: String(new Date().getFullYear()),
    blurb: '一句话介绍这个项目。',
    href: '',
    tags: [],
    status: 'planning',
  })
}
function delProject(i) {
  if (!confirm('删这个项目？')) return
  projects.value.splice(i, 1)
}
function addProjectTag(p) {
  p.tags = p.tags || []
  p.tags.push('新标签')
}
function delProjectTag(p, i) {
  p.tags.splice(i, 1)
}

/* ---------- Tools CRUD ---------- */
function addTool() {
  tools.value.unshift({
    id: 'tool-' + Math.random().toString(36).slice(2, 7),
    name: '新工具',
    status: 'offline',
    blurb: '一句话介绍这个工具。',
    span: 'narrow',
    component: null,
  })
}
function delTool(i) {
  if (!confirm('删这个工具？')) return
  tools.value.splice(i, 1)
}

/* ---------- Posts CRUD ---------- */
function addPost() {
  const today = new Date()
  const d = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  posts.value.unshift({
    id: 'post-' + Math.random().toString(36).slice(2, 7),
    title: '新文章标题',
    date: d,
    tags: [],
    excerpt: '摘要，会显示在列表和首页。',
    content: '# 新文章\n\n从这里开始写正文吧。支持 Markdown：**粗体**、*斜体*、`code`、列表、链接。',
  })
  activePostPreview.value = posts.value[0]
}
function delPost(i) {
  if (!confirm('删这篇文章？')) return
  posts.value.splice(i, 1)
}
function addPostTag(p) {
  p.tags = p.tags || []
  p.tags.push('标签')
}
function delPostTag(p, i) {
  p.tags.splice(i, 1)
}
const activePostPreview = ref(null)
watch(
  posts,
  (list) => {
    if (activePostPreview.value && !list.includes(activePostPreview.value)) {
      activePostPreview.value = list[0] || null
    } else if (!activePostPreview.value && list.length) {
      activePostPreview.value = list[0]
    }
  },
  { immediate: true }
)

/* ---------- Kids CRUD ---------- */
function addKid() {
  kids.value.unshift({
    id: 'kid-' + Math.random().toString(36).slice(2, 7),
    title: '新内容',
    age: '3-5',
    status: 'planning',
    blurb: '一句话介绍这份 Kids 内容。',
    content: '# 新内容\n\n给孩子看的东西写在这里。',
  })
  activeKidPreview.value = kids.value[0]
}
function delKid(i) {
  if (!confirm('删这份 Kids 内容？')) return
  kids.value.splice(i, 1)
}
const activeKidPreview = ref(null)
watch(
  kids,
  (list) => {
    if (activeKidPreview.value && !list.includes(activeKidPreview.value)) {
      activeKidPreview.value = list[0] || null
    } else if (!activeKidPreview.value && list.length) {
      activeKidPreview.value = list[0]
    }
  },
  { immediate: true }
)

/* ---------- 提交发布 ---------- */
import { renderMarkdown } from '../composables/useMarkdown'
const deployMsg = ref('chore(content): update site')
const deploying = ref(false)
const deployLog = ref('')
const deployError = ref('')

async function doDeploy() {
  if (!confirm('确认提交当前所有改动到仓库？这会触发 GitHub Pages 重新部署。')) return
  deploying.value = true
  deployError.value = ''
  deployLog.value = '准备文件…\n'
  try {
    const files = getAllData()
    deployLog.value += `共 ${Object.keys(files).length} 个文件待写入。\n`
    await writeFiles(loginForm, files, deployMsg.value || 'chore(content): update site')
    deployLog.value += '全部写入成功！GitHub Actions 应该已经开始构建了。\n'
    deployLog.value += `构建通常需要 1-3 分钟，完成后刷新前台页面就能看到最新内容。\n`
  } catch (e) {
    deployError.value = e.message || '发布失败'
    deployLog.value += `失败：${e.message}\n`
  } finally {
    deploying.value = false
  }
}

const dirtyCount = computed(() => {
  // 简单统计一下：没法和 import 进来的 JSON 原数据比（Vite import 可能会被优化），
  // 所以给一个"当前条目的总计数"提示即可。
  return (
    projects.value.length +
    tools.value.length +
    posts.value.length +
    kids.value.length
  )
})
</script>

<template>
  <section class="view-frame admin">
    <div class="hd">
      <div>
        <p class="kicker"><span>CTRL</span> Admin</p>
        <h1>内容控制台</h1>
      </div>
      <div class="hd-right">
        <RouterLink to="/" class="back">← 回到站点</RouterLink>
        <button v-if="loggedIn" class="btn btn-ghost" @click="doLogout">退出</button>
      </div>
    </div>

    <!-- 登录面板 -->
    <div v-if="!loggedIn" class="login-wrap">
      <div class="panel login">
        <h2>接入 GitHub 仓库</h2>
        <p class="hint">
          填下面 4 项就可以直接在网页上改内容，保存后会自动提交到仓库并触发 Pages 重新部署。
          Token 只存在你自己浏览器的 localStorage，不会上传到任何地方。
        </p>
        <label>
          <span>Personal Access Token</span>
          <input
            v-model="loginForm.token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx（需要 Contents 读写权限）"
            autocomplete="off"
          />
        </label>
        <div class="row2">
          <label>
            <span>Owner（用户名或组织）</span>
            <input v-model="loginForm.owner" type="text" placeholder="e1ectronic-ovo" />
          </label>
          <label>
            <span>Repo</span>
            <input v-model="loginForm.repo" type="text" placeholder="electronic.github.io" />
          </label>
        </div>
        <div class="row2">
          <label>
            <span>分支</span>
            <input v-model="loginForm.branch" type="text" placeholder="main" />
          </label>
          <label>
            <span>API Base（留空 = github.com）</span>
            <input v-model="loginForm.apiBase" type="text" placeholder="https://api.github.com" />
          </label>
        </div>
        <p v-if="loginError" class="error">{{ loginError }}</p>
        <button class="btn btn-primary" :disabled="loginLoading" @click="doLogin">
          {{ loginLoading ? '验证中…' : '验证并进入' }}
        </button>
        <details class="help">
          <summary>怎么获取 Token？</summary>
          <ol>
            <li>GitHub 右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
            <li>Generate new token (classic)，勾选 <code>repo</code> 权限（Contents 读写）</li>
            <li>复制生成的 <code>ghp_</code> 开头的 Token 填到上面</li>
            <li>如果是公开仓库，Fine-grained token 也行：Repository permissions → Contents → Read and write</li>
          </ol>
        </details>
      </div>
    </div>

    <!-- 主控制台 -->
    <div v-else class="console">
      <nav class="tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="tab"
          :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key"
        >
          <span class="tab-ico" aria-hidden="true">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
        </button>
      </nav>

      <div class="tab-body">
        <!-- Profile -->
        <section v-if="activeTab === 'profile'" class="tab-panel">
          <div class="panel-hd">
            <h2>个人信息</h2>
            <p class="muted">首页顶部、关于页都会用到这里的数据。</p>
          </div>
          <div class="form-grid">
            <label><span>Callsign（大标题）</span><input v-model="profile.callsign" /></label>
            <label><span>显示名</span><input v-model="profile.name" /></label>
            <label><span>身份（副标题）</span><input v-model="profile.role" /></label>
            <label><span>站点标语</span><input v-model="profile.tagline" /></label>
            <label><span>观测舱 / 小标签</span><input v-model="profile.station" /></label>
            <label><span>位置（可选）</span><input v-model="profile.location" /></label>
            <label><span>GitHub</span><input v-model="profile.github" /></label>
            <label><span>Email（可选）</span><input v-model="profile.email" placeholder="you@example.com" /></label>
          </div>

          <h3 class="sh">关于页 · 开头一句话</h3>
          <textarea v-model="profile.about.lead" rows="2" class="wide-ta"></textarea>

          <h3 class="sh">关于页 · 正文段落</h3>
          <div class="array-list">
            <div v-for="(p, i) in profile.about.body" :key="i" class="array-item">
              <textarea v-model="profile.about.body[i]" rows="2"></textarea>
              <button class="btn btn-x" @click="delBody(i)" title="删除段落">×</button>
            </div>
          </div>
          <button class="btn btn-ghost" @click="addBody">+ 加一段</button>

          <h3 class="sh">关于页 · 专注标签</h3>
          <div class="array-list">
            <div v-for="(f, i) in profile.about.focus" :key="i" class="array-item focus-row">
              <input v-model="f.code" placeholder="CODE" class="w-code" />
              <input v-model="f.label" placeholder="名称" class="w-label" />
              <input v-model="f.note" placeholder="一句话说明" />
              <button class="btn btn-x" @click="delFocus(i)" title="删除">×</button>
            </div>
          </div>
          <button class="btn btn-ghost" @click="addFocus">+ 加一个</button>

          <h3 class="sh">关于页 · 外部链接</h3>
          <div class="array-list">
            <div v-for="(l, i) in profile.links" :key="i" class="array-item">
              <input v-model="l.label" placeholder="名称" class="w-label" />
              <input v-model="l.href" placeholder="https://..." />
              <button class="btn btn-x" @click="delLink(i)" title="删除">×</button>
            </div>
          </div>
          <button class="btn btn-ghost" @click="addLink">+ 加一个</button>
        </section>

        <!-- Projects -->
        <section v-if="activeTab === 'projects'" class="tab-panel">
          <div class="panel-hd row-between">
            <div>
              <h2>项目列表</h2>
              <p class="muted">共 {{ projects.length }} 条。</p>
            </div>
            <button class="btn btn-primary" @click="addProject">+ 新项目</button>
          </div>
          <div class="cards">
            <div v-for="(p, i) in projects" :key="i" class="card2">
              <div class="card2-hd">
                <input v-model="p.name" placeholder="项目名" class="fill" />
                <button class="btn btn-x" @click="delProject(i)" title="删除">×</button>
              </div>
              <div class="row3">
                <input v-model="p.year" placeholder="年份" class="w-sm" />
                <select v-model="p.status" class="w-md">
                  <option value="online">在线</option>
                  <option value="planning">计划中</option>
                  <option value="offline">未上线</option>
                </select>
                <input v-model="p.href" placeholder="链接（空则不可点）" />
              </div>
              <textarea v-model="p.blurb" rows="2" placeholder="一句话介绍"></textarea>
              <div class="tags-row">
                <span class="chip" v-for="(t, ti) in p.tags" :key="ti">
                  <input v-model="p.tags[ti]" />
                  <button class="btn btn-x" @click="delProjectTag(p, ti)" title="移除">×</button>
                </span>
                <button class="btn btn-ghost btn-sm" @click="addProjectTag(p)">+ 标签</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Tools -->
        <section v-if="activeTab === 'tools'" class="tab-panel">
          <div class="panel-hd row-between">
            <div>
              <h2>工具列表</h2>
              <p class="muted">共 {{ tools.length }} 条。只有 status=在线 + 有组件挂载时才能真正进入。</p>
            </div>
            <button class="btn btn-primary" @click="addTool">+ 新工具</button>
          </div>
          <div class="cards">
            <div v-for="(t, i) in tools" :key="i" class="card2">
              <div class="card2-hd">
                <input v-model="t.id" placeholder="id（URL 用，不改已有）" class="w-md mono" />
                <input v-model="t.name" placeholder="工具名" class="fill" />
                <button class="btn btn-x" @click="delTool(i)" title="删除">×</button>
              </div>
              <div class="row3">
                <select v-model="t.status" class="w-md">
                  <option value="online">在线</option>
                  <option value="offline">未上线</option>
                </select>
                <select v-model="t.span" class="w-md">
                  <option value="wide">宽（大卡片左列跨两行）</option>
                  <option value="narrow">窄（小卡片）</option>
                </select>
              </div>
              <textarea v-model="t.blurb" rows="2" placeholder="一句话介绍"></textarea>
            </div>
          </div>
        </section>

        <!-- Posts -->
        <section v-if="activeTab === 'posts'" class="tab-panel">
          <div class="panel-hd row-between">
            <div>
              <h2>博客文章</h2>
              <p class="muted">共 {{ posts.length }} 篇。支持 Markdown 正文。</p>
            </div>
            <button class="btn btn-primary" @click="addPost">+ 新文章</button>
          </div>
          <div class="split">
            <div class="split-list">
              <div
                v-for="(p, i) in posts"
                :key="i"
                class="list-row"
                :class="{ active: activePostPreview === p }"
                @click="activePostPreview = p"
              >
                <div class="lr-main">
                  <strong>{{ p.title || '(未命名)' }}</strong>
                  <em>{{ p.excerpt || '(没摘要)' }}</em>
                </div>
                <div class="lr-side">
                  <span class="date">{{ p.date }}</span>
                  <button class="btn btn-x" @click.stop="delPost(i)" title="删除">×</button>
                </div>
              </div>
              <div v-if="!posts.length" class="empty muted">点右上按钮写第一篇。</div>
            </div>
            <div v-if="activePostPreview" class="split-edit">
              <label><span>ID（URL 用，改了会让旧链接失效）</span>
                <input v-model="activePostPreview.id" class="mono" />
              </label>
              <label><span>标题</span><input v-model="activePostPreview.title" /></label>
              <div class="row3">
                <label class="grow"><span>日期</span><input v-model="activePostPreview.date" type="date" /></label>
              </div>
              <label><span>摘要（列表/首页显示）</span>
                <textarea v-model="activePostPreview.excerpt" rows="2"></textarea>
              </label>
              <div class="tags-row">
                <span class="chip" v-for="(t, ti) in activePostPreview.tags" :key="ti">
                  <input v-model="activePostPreview.tags[ti]" />
                  <button class="btn btn-x" @click="delPostTag(activePostPreview, ti)">×</button>
                </span>
                <button class="btn btn-ghost btn-sm" @click="addPostTag(activePostPreview)">+ 标签</button>
              </div>
              <label><span>正文（Markdown）</span>
                <textarea v-model="activePostPreview.content" rows="14" class="mono md-ta"></textarea>
              </label>
              <details class="preview">
                <summary>预览渲染结果</summary>
                <div class="md-preview md" v-html="renderMarkdown(activePostPreview.content)"></div>
              </details>
            </div>
            <div v-else class="split-edit empty muted">选左边一篇来编辑。</div>
          </div>
        </section>

        <!-- Kids -->
        <section v-if="activeTab === 'kids'" class="tab-panel">
          <div class="panel-hd row-between">
            <div>
              <h2>Kids 内容</h2>
              <p class="muted">共 {{ kids.length }} 份。留给孩子未来看的互动/学习内容占位。</p>
            </div>
            <button class="btn btn-primary" @click="addKid">+ 新内容</button>
          </div>
          <div class="split">
            <div class="split-list">
              <div
                v-for="(k, i) in kids"
                :key="i"
                class="list-row"
                :class="{ active: activeKidPreview === k }"
                @click="activeKidPreview = k"
              >
                <div class="lr-main">
                  <strong>{{ k.title || '(未命名)' }}</strong>
                  <em>{{ k.blurb || '(没介绍)' }}</em>
                </div>
                <div class="lr-side">
                  <span class="date">Age {{ k.age }}</span>
                  <button class="btn btn-x" @click.stop="delKid(i)" title="删除">×</button>
                </div>
              </div>
              <div v-if="!kids.length" class="empty muted">点右上按钮加第一个。</div>
            </div>
            <div v-if="activeKidPreview" class="split-edit">
              <label><span>ID（URL 用）</span>
                <input v-model="activeKidPreview.id" class="mono" />
              </label>
              <div class="row3">
                <label class="grow"><span>标题</span><input v-model="activeKidPreview.title" /></label>
                <label class="w-md"><span>适用年龄</span><input v-model="activeKidPreview.age" placeholder="3-5" /></label>
                <label class="w-md"><span>状态</span>
                  <select v-model="activeKidPreview.status">
                    <option value="online">在线</option>
                    <option value="planning">计划中</option>
                    <option value="offline">未上线</option>
                  </select>
                </label>
              </div>
              <label><span>一句话介绍</span>
                <textarea v-model="activeKidPreview.blurb" rows="2"></textarea>
              </label>
              <label><span>正文（Markdown，未来可替换成交互组件）</span>
                <textarea v-model="activeKidPreview.content" rows="14" class="mono md-ta"></textarea>
              </label>
              <details class="preview">
                <summary>预览渲染结果</summary>
                <div class="md-preview md" v-html="renderMarkdown(activeKidPreview.content)"></div>
              </details>
            </div>
            <div v-else class="split-edit empty muted">选左边一份来编辑。</div>
          </div>
        </section>

        <!-- Deploy -->
        <section v-if="activeTab === 'deploy'" class="tab-panel">
          <div class="panel-hd">
            <h2>提交并发布</h2>
            <p class="muted">
              当前共有 <strong>{{ dirtyCount }}</strong> 条内容条目（项目+工具+文章+Kids）。
              改完之后按下面按钮一次性提交所有 JSON 到仓库，自动触发 Pages 重新部署。
            </p>
          </div>

          <div class="deploy-card panel">
            <label>
              <span>Commit message</span>
              <input v-model="deployMsg" placeholder="chore(content): update site" />
            </label>
            <div class="conn">
              <span class="ok" aria-hidden="true">●</span>
              已连接：<code>{{ loginForm.owner }}/{{ loginForm.repo }}@{{ loginForm.branch }}</code>
            </div>
            <button class="btn btn-primary" :disabled="deploying" @click="doDeploy">
              {{ deploying ? '提交中…' : '⇧ 提交所有改动并发布' }}
            </button>
            <p v-if="deployError" class="error">失败：{{ deployError }}</p>
            <pre v-if="deployLog" class="log">{{ deployLog }}</pre>
          </div>

          <h3 class="sh">本次要提交的文件</h3>
          <div class="file-list">
            <div v-for="(content, path) in getAllData()" :key="path" class="file-item">
              <span class="p">{{ path }}</span>
              <span class="sz">{{ content.length }} bytes</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin {
  min-height: 100%;
}
.hd {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.6rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.hd h1 {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.hd-right {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.back {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--ice);
  opacity: 0.85;
  border-bottom: 1px solid transparent;
  padding-bottom: 0.1rem;
}
.back:hover {
  color: var(--ice-bright);
  border-bottom-color: var(--ice);
}

/* 通用按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.95rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.02);
  color: var(--mist);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s var(--ease);
}
.btn:hover:not(:disabled) {
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.04);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--ice);
  border-color: var(--ice);
  color: #0a0e12;
  font-weight: 600;
}
.btn-primary:hover:not(:disabled) {
  background: var(--ice-bright);
  border-color: var(--ice-bright);
}
.btn-ghost {
  background: transparent;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.7rem;
}
.btn-x {
  padding: 0.1rem 0.5rem;
  font-size: 0.95rem;
  line-height: 1;
  min-height: 1.6rem;
  border-color: transparent;
  color: var(--warm);
}
.btn-x:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 80, 80, 0.08);
}

/* 登录 */
.login-wrap {
  max-width: 620px;
}
.login {
  padding: 1.8rem;
  display: grid;
  gap: 1rem;
}
.login h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 650;
}
.login .hint {
  margin: 0;
  opacity: 0.72;
  line-height: 1.6;
  font-size: 0.95rem;
}
.login label,
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ice);
}
.login input,
input,
select,
textarea {
  background: rgba(10, 14, 18, 0.5);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--mist);
  padding: 0.55rem 0.75rem;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  letter-spacing: 0;
  text-transform: none;
  transition: border-color 0.2s var(--ease), background 0.2s var(--ease);
}
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--ice);
  background: rgba(10, 14, 18, 0.75);
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.row3 {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 0.6rem;
  align-items: end;
}
.row3 > label.grow {
  grid-column: auto;
}
.w-sm { width: 7rem; }
.w-md { width: 10rem; }
.w-code { width: 5rem; }
.w-label { width: 9rem; }
.mono { font-family: var(--font-mono); font-size: 0.85rem; }
.error {
  margin: 0;
  color: var(--warm);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
.help {
  margin-top: 0.5rem;
  opacity: 0.8;
  font-size: 0.9rem;
}
.help summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--ice);
  padding: 0.4rem 0;
}
.help ol {
  padding-left: 1.2rem;
  line-height: 1.7;
  margin: 0.6rem 0;
}
.help code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  background: rgba(127, 158, 168, 0.12);
  border-radius: 3px;
  color: var(--ice-bright);
}

/* 主控制台 */
.console {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.2rem;
  align-items: start;
}
.tabs {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: sticky;
  top: 1rem;
}
.tab {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--mist);
  opacity: 0.8;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s var(--ease);
}
.tab:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.02);
}
.tab.active {
  opacity: 1;
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ice-bright);
}
.tab-ico {
  width: 1.2rem;
  display: inline-flex;
  justify-content: center;
  color: var(--warm);
}
.tab.active .tab-ico {
  color: var(--ice-bright);
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-bottom: 2rem;
}
.panel-hd {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--line);
}
.panel-hd.row-between {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.panel-hd h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 650;
}
.panel-hd .muted {
  margin: 0;
  opacity: 0.6;
  font-size: 0.88rem;
}
.muted { opacity: 0.65; }

.sh {
  margin: 1.2rem 0 0.6rem;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.wide-ta {
  width: 100%;
  resize: vertical;
}
.array-list {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.array-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: start;
}
.array-item.focus-row {
  grid-template-columns: 5rem 9rem 1fr auto;
  align-items: stretch;
}
.array-item textarea,
.array-item input {
  width: 100%;
}
.array-item textarea {
  min-height: 2.5rem;
  resize: vertical;
}

/* cards list (projects, tools) */
.cards {
  display: grid;
  gap: 0.8rem;
}
.card2 {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 2px);
  background: rgba(255, 255, 255, 0.015);
}
.card2-hd {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.card2-hd .fill { flex: 1; }
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.2rem 0.3rem 0.2rem 0.7rem;
}
.chip input {
  border: none;
  background: transparent;
  padding: 0.1rem 0.2rem;
  font-size: 0.82rem;
  min-width: 3rem;
  width: auto;
}
.chip input:focus {
  border: none;
  background: transparent;
}

/* split view (posts, kids) */
.split {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1rem;
  align-items: start;
}
.split-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 70vh;
  overflow: auto;
  padding-right: 0.3rem;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 2px);
  background: rgba(255, 255, 255, 0.01);
}
.list-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background 0.2s var(--ease);
}
.list-row:last-child { border-bottom: none; }
.list-row:hover { background: rgba(255, 255, 255, 0.025); }
.list-row.active {
  background: rgba(127, 190, 210, 0.08);
  border-color: rgba(127, 190, 210, 0.3);
}
.lr-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.lr-main strong {
  font-size: 0.95rem;
  font-weight: 600;
}
.lr-main em {
  font-style: normal;
  font-size: 0.82rem;
  opacity: 0.65;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lr-side {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  opacity: 0.75;
  white-space: nowrap;
}
.split-edit {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 2px);
  background: rgba(255, 255, 255, 0.015);
  max-height: 75vh;
  overflow: auto;
}
.split-edit .grow { flex: 1; }
.md-ta {
  line-height: 1.6;
  font-size: 0.88rem;
}
.preview summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ice);
  padding: 0.3rem 0;
}
.md-preview {
  margin-top: 0.8rem;
  padding: 1rem;
  background: rgba(10, 14, 18, 0.55);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  line-height: 1.7;
  max-height: 50vh;
  overflow: auto;
}
.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  margin: 1.2em 0 0.5em;
}
.md-preview :deep(p) { margin: 0 0 0.8rem; }
.md-preview :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 0.1em 0.35em;
  background: rgba(127, 158, 168, 0.12);
  border-radius: 3px;
  color: var(--ice-bright);
}
.md-preview :deep(pre) {
  padding: 0.8rem 1rem;
  background: rgba(10, 14, 18, 0.6);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
}
.md-preview :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--mist);
}
.md-preview :deep(blockquote) {
  margin: 0.8rem 0;
  padding: 0.4rem 0.8rem;
  border-left: 2px solid var(--ice);
  background: rgba(255, 255, 255, 0.02);
  opacity: 0.9;
}
.empty {
  padding: 1.4rem;
  text-align: center;
  font-size: 0.9rem;
}

/* deploy */
.deploy-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem;
}
.deploy-card .btn-primary {
  align-self: flex-start;
  padding: 0.7rem 1.2rem;
  font-size: 0.82rem;
}
.conn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  opacity: 0.9;
}
.conn .ok { color: var(--ice-bright); }
.conn code {
  padding: 0.15em 0.4em;
  background: rgba(127, 158, 168, 0.12);
  border-radius: 3px;
  color: var(--ice-bright);
  font-size: 0.9em;
}
.log {
  margin: 0;
  padding: 0.8rem 1rem;
  background: #0a0e12;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ice);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 220px;
  overflow: auto;
}
.file-list {
  display: grid;
  gap: 0.3rem;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}
.file-item .p {
  color: var(--ice-bright);
}
.file-item .sz {
  opacity: 0.6;
}

@media (max-width: 960px) {
  .console {
    grid-template-columns: 1fr;
  }
  .tabs {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }
  .tab {
    flex-shrink: 0;
  }
  .split {
    grid-template-columns: 1fr;
  }
  .split-list,
  .split-edit {
    max-height: none;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .row2,
  .row3 {
    grid-template-columns: 1fr;
  }
  .w-sm,
  .w-md,
  .w-code,
  .w-label { width: 100%; }
  .array-item.focus-row {
    grid-template-columns: 1fr;
  }
  .panel-hd.row-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}
</style>
