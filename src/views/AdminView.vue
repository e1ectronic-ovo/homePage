<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  profile,
  posts,
  kids,
  getAllData,
} from '../composables/useData'
import {
  saveAdminToken,
  loadAdminToken,
  clearAdminToken,
  verifyAccess,
  writeFiles,
  getRepoConfig,
  buildGithubConfig,
} from '../composables/useGithub'
import AdminMarkdownEditor from '../components/admin/AdminMarkdownEditor.vue'
import {
  isGateOpen,
  verifyGatePassword,
  getGateStatus,
} from '../composables/useAdminGate'

const repoConfig = getRepoConfig()

/* ---------- 入口密码门禁 ---------- */
const gateOpen = ref(isGateOpen())
const gatePassword = ref('')
const gateLoading = ref(false)
const gateError = ref('')
const gateStatus = ref(getGateStatus())

function refreshGateStatus() {
  gateStatus.value = getGateStatus()
}

async function doGateUnlock() {
  gateLoading.value = true
  gateError.value = ''
  try {
    await verifyGatePassword(gatePassword.value)
    gateOpen.value = true
    gatePassword.value = ''
  } catch (e) {
    gateError.value = e.message || '验证失败'
    refreshGateStatus()
  } finally {
    gateLoading.value = false
  }
}

/* ---------- GitHub Token 登录 ---------- */
const loggedIn = ref(false)
const tokenInput = ref('')
const loginLoading = ref(false)
const loginError = ref('')

onMounted(() => {
  refreshGateStatus()
  tokenInput.value = loadAdminToken()
})

async function doLogin() {
  loginLoading.value = true
  loginError.value = ''
  try {
    if (!tokenInput.value) throw new Error('Token 不能空')
    const cfg = buildGithubConfig(tokenInput.value)
    await verifyAccess(cfg)
    saveAdminToken(tokenInput.value)
    loggedIn.value = true
  } catch (e) {
    loginError.value = e.message || '验证失败'
  } finally {
    loginLoading.value = false
  }
}
function doLogout() {
  clearAdminToken()
  loggedIn.value = false
  loginError.value = ''
  tokenInput.value = ''
}

/* ---------- 选中的模块 tab ---------- */
const activeTab = ref('profile')

const TABS = [
  { key: 'profile', label: '个人信息', icon: '◉' },
  { key: 'posts', label: '博客文章', icon: '✎' },
  { key: 'kids', label: 'Kids 内容', icon: '❀' },
  { key: 'deploy', label: '提交 & 发布', icon: '⇧' },
]

/* ---------- Profile 编辑 ---------- */
// profile 是 ref object，直接双向绑定其字段。
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
function kidKind(k) {
  if (!k) return 'content'
  if (k.kind === 'stories' || Array.isArray(k.stories)) return 'stories'
  if (k.kind === 'letter' || k.letter) return 'letter'
  if (k.kind === 'play') return 'play'
  return 'content'
}
function ensureKidShape(k) {
  if (!k) return
  if (kidKind(k) === 'stories' && !Array.isArray(k.stories)) k.stories = []
  if (kidKind(k) === 'letter') {
    if (!k.letter) k.letter = { salute: '', paragraphs: [], sign: '' }
    if (!Array.isArray(k.letter.paragraphs)) k.letter.paragraphs = []
  }
}
function addStory() {
  ensureKidShape(activeKidPreview.value)
  activeKidPreview.value.stories.push({
    title: '新故事',
    text: '在这里写故事正文……',
  })
}
function delStory(i) {
  if (!confirm('删这个故事？')) return
  activeKidPreview.value.stories.splice(i, 1)
}
function addLetterParagraph() {
  ensureKidShape(activeKidPreview.value)
  activeKidPreview.value.letter.paragraphs.push('新段落……')
}
function delLetterParagraph(i) {
  activeKidPreview.value.letter.paragraphs.splice(i, 1)
}
function onKidKindChange() {
  ensureKidShape(activeKidPreview.value)
}
function addKid() {
  kids.value.unshift({
    id: 'kid-' + Math.random().toString(36).slice(2, 7),
    kind: 'content',
    title: '新内容',
    age: '胎教',
    status: 'planning',
    blurb: '一句话介绍这份胎教内容。',
    content: '',
  })
  activeKidPreview.value = kids.value[0]
  ensureKidShape(activeKidPreview.value)
}
function delKid(i) {
  if (!confirm('删这份 Kids 内容？')) return
  kids.value.splice(i, 1)
}
const activeKidPreview = ref(null)
watch(activeKidPreview, (k) => {
  if (k) ensureKidShape(k)
})
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
    await writeFiles(buildGithubConfig(), files, deployMsg.value || 'chore(content): update site')
    deployLog.value += '全部写入成功！GitHub Actions 应该已经开始构建了。\n'
    deployLog.value += `构建通常需要 1-3 分钟，完成后刷新前台页面就能看到最新内容。\n`
  } catch (e) {
    deployError.value = e.message || '发布失败'
    deployLog.value += `失败：${e.message}\n`
  } finally {
    deploying.value = false
  }
}

const dirtyCount = computed(() => posts.value.length + kids.value.length)
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

    <!-- 入口密码 -->
    <div v-if="!gateOpen" class="login-wrap">
      <div class="panel login">
        <h2>访问验证</h2>
        <p class="hint">
          管理控制台仅限本人使用。输入访问密码后继续；连续输错 5 次将锁定 30 分钟。
        </p>
        <label>
          <span>访问密码</span>
          <input
            v-model="gatePassword"
            type="password"
            placeholder="输入密码"
            autocomplete="off"
            :disabled="gateStatus.locked || gateLoading"
            @keyup.enter="doGateUnlock"
          />
        </label>
        <p v-if="gateStatus.locked" class="error">
          已锁定，请 {{ Math.ceil(gateStatus.waitMs / 60000) }} 分钟后再试。
        </p>
        <p v-else-if="gateStatus.attempts > 0" class="warn">
          已失败 {{ gateStatus.attempts }} 次，还可尝试 {{ gateStatus.remaining }} 次。
        </p>
        <p v-if="gateError" class="error">{{ gateError }}</p>
        <button
          class="btn btn-primary"
          :disabled="gateLoading || gateStatus.locked || !gatePassword"
          @click="doGateUnlock"
        >
          {{ gateLoading ? '验证中…' : '进入' }}
        </button>
      </div>
    </div>

    <!-- Token 登录 -->
    <div v-else-if="!loggedIn" class="login-wrap">
      <div class="panel login">
        <h2>接入 GitHub 仓库</h2>
        <p class="hint">
          仓库已固定为
          <code>{{ repoConfig.owner }}/{{ repoConfig.repo }}@{{ repoConfig.branch }}</code>。
          填入 Personal Access Token 即可在网页上改内容并自动触发 Pages 重新部署。
          Token 只存在你自己浏览器的 localStorage，不会上传到任何地方。
        </p>
        <label>
          <span>Personal Access Token</span>
          <input
            v-model="tokenInput"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx（需要 Contents 读写权限）"
            autocomplete="off"
          />
        </label>
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
          <div class="lead-edit">
            <label><span>第一行（英文）</span><input v-model="profile.about.lead[0]" /></label>
            <label><span>第二行（中文）</span><input v-model="profile.about.lead[1]" /></label>
          </div>

          <h3 class="sh">关于页 · 正文段落</h3>
          <div class="array-list">
            <div v-for="(p, i) in profile.about.body" :key="i" class="array-item">
              <textarea v-model="profile.about.body[i]" rows="2"></textarea>
              <button class="btn btn-x" @click="delBody(i)" title="删除段落">×</button>
            </div>
          </div>
          <button class="btn btn-ghost" @click="addBody">+ 加一段</button>

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
              <div class="editor-field">
                <span class="field-label">正文（Markdown）</span>
                <AdminMarkdownEditor
                  :key="activePostPreview.id"
                  editor-id="admin-post-md"
                  v-model="activePostPreview.content"
                  placeholder="在这里写正文…"
                />
              </div>
            </div>
            <div v-else class="split-edit empty muted">选左边一篇来编辑。</div>
          </div>
        </section>

        <!-- Kids -->
        <section v-if="activeTab === 'kids'" class="tab-panel">
          <div class="panel-hd row-between">
            <div>
              <h2>Kids 内容</h2>
              <p class="muted">共 {{ kids.length }} 份。孕期朗读、静心，或给宝宝的信。</p>
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
                  <span class="date">{{ k.age }}</span>
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
                <label class="w-md"><span>阶段</span><input v-model="activeKidPreview.age" placeholder="胎教" /></label>
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
              <label>
                <span>内容类型</span>
                <select v-model="activeKidPreview.kind" @change="onKidKindChange">
                  <option value="play">互动页（固定组件，如呼吸练习）</option>
                  <option value="stories">胎教故事（JSON 故事列表）</option>
                  <option value="letter">给宝宝信（JSON 信件）</option>
                  <option value="content">Markdown 正文</option>
                </select>
              </label>

              <!-- 胎教故事 -->
              <template v-if="kidKind(activeKidPreview) === 'stories'">
                <div class="panel-hd row-between">
                  <h3 class="sh">故事列表</h3>
                  <button class="btn btn-ghost btn-sm" @click="addStory">+ 加故事</button>
                </div>
                <div class="story-list">
                  <div v-for="(s, i) in activeKidPreview.stories" :key="i" class="story-item panel">
                    <div class="story-hd">
                      <input v-model="s.title" placeholder="故事标题" class="fill" />
                      <button class="btn btn-x" @click="delStory(i)" title="删除">×</button>
                    </div>
                    <textarea v-model="s.text" rows="12" placeholder="故事正文，换行会保留"></textarea>
                  </div>
                  <div v-if="!activeKidPreview.stories.length" class="empty muted">
                    还没有故事，点右上「加故事」。
                  </div>
                </div>
              </template>

              <!-- 给宝宝信 -->
              <template v-else-if="kidKind(activeKidPreview) === 'letter'">
                <label><span>抬头</span><input v-model="activeKidPreview.letter.salute" /></label>
                <h3 class="sh">正文段落</h3>
                <div class="array-list">
                  <div v-for="(p, i) in activeKidPreview.letter.paragraphs" :key="i" class="array-item">
                    <textarea v-model="activeKidPreview.letter.paragraphs[i]" rows="2"></textarea>
                    <button class="btn btn-x" @click="delLetterParagraph(i)" title="删除">×</button>
                  </div>
                </div>
                <button class="btn btn-ghost" @click="addLetterParagraph">+ 加一段</button>
                <label><span>落款</span><input v-model="activeKidPreview.letter.sign" /></label>
              </template>

              <!-- Markdown / 备注 -->
              <div v-else class="editor-field">
                <span class="field-label">正文 / 备注（Markdown）</span>
                <AdminMarkdownEditor
                  :key="activeKidPreview.id + '-md'"
                  editor-id="admin-kid-md"
                  v-model="activeKidPreview.content"
                  placeholder="备用正文或给互动页的说明…"
                />
              </div>
            </div>
            <div v-else class="split-edit empty muted">选左边一份来编辑。</div>
          </div>
        </section>

        <!-- Deploy -->
        <section v-if="activeTab === 'deploy'" class="tab-panel">
          <div class="panel-hd">
            <h2>提交并发布</h2>
            <p class="muted">
              当前共有 <strong>{{ dirtyCount }}</strong> 条内容条目（文章 + Kids）。
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
              已连接：<code>{{ repoConfig.owner }}/{{ repoConfig.repo }}@{{ repoConfig.branch }}</code>
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
  font-family: var(--font-body);
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
.warn {
  margin: 0;
  color: var(--ice);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  opacity: 0.85;
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
.editor-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.field-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ice);
}
.story-list {
  display: grid;
  gap: 0.75rem;
}
.story-item {
  display: grid;
  gap: 0.6rem;
  padding: 0.85rem;
}
.story-hd {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.story-hd .fill {
  flex: 1;
}
.story-item textarea {
  width: 100%;
  resize: vertical;
  min-height: 5rem;
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
    gap: 0.85rem;
  }
  .tabs {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.2rem;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    flex-shrink: 0;
    min-height: var(--touch);
  }
  .split {
    grid-template-columns: 1fr;
  }
  .split-list {
    max-height: 42vh;
  }
  .split-edit {
    max-height: none;
    padding: 0.85rem;
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
  .hd {
    align-items: flex-start;
  }
  .btn {
    min-height: var(--touch);
  }
  .deploy-card .btn-primary {
    align-self: stretch;
    width: 100%;
  }
  .conn {
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .admin {
    padding-bottom: calc(3.75rem + var(--safe-bottom));
  }

  .console {
    padding-bottom: 0;
  }

  .tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    flex-direction: row;
    justify-content: space-around;
    gap: 0.15rem;
    margin: 0;
    padding:
      0.35rem max(0.45rem, var(--safe-left))
      calc(0.4rem + var(--safe-bottom))
      max(0.45rem, var(--safe-right));
    background: rgba(7, 9, 13, 0.96);
    border-top: 1px solid var(--line);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .tab {
    flex: 1;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.4rem 0.25rem;
    font-size: 0.58rem;
    letter-spacing: 0.06em;
    text-align: center;
    border-color: transparent;
  }

  .tab-ico {
    width: auto;
    font-size: 1rem;
  }

  .login-wrap {
    max-width: none;
  }

  .login {
    padding: 1.25rem;
  }

  .list-row {
    padding: 0.85rem 0.65rem;
  }

  .lr-side .date {
    display: none;
  }
}
</style>
