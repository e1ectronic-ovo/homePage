/**
 * 通过 GitHub Contents API 把修改后的 JSON 文件直接提交到仓库，
 * 触发 GitHub Pages workflow 自动重新部署。
 *
 * 仓库 owner/repo/branch 已写死在 config/github.js；
 * 仅需在 /admin 填写 Personal Access Token。
 * Token 只存 localStorage，不传到任何第三方。
 */

import { GITHUB_REPO } from '../config/github'

const TOKEN_KEY = 'gh_admin_token'

export function getRepoConfig() {
  return { ...GITHUB_REPO }
}

export function saveAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function loadAdminToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) return token
  // 迁移旧版整包配置
  const raw = localStorage.getItem('gh_admin_config')
  if (!raw) return ''
  try {
    const cfg = JSON.parse(raw)
    if (cfg?.token) {
      saveAdminToken(cfg.token)
      localStorage.removeItem('gh_admin_config')
      return cfg.token
    }
  } catch {}
  return ''
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** 合并写死的仓库配置与本地 Token */
export function buildGithubConfig(token) {
  return { ...GITHUB_REPO, token: token || loadAdminToken() }
}

/** @deprecated 兼容旧调用，仅保存 token */
export function saveAdminConfig(cfg) {
  saveAdminToken(cfg?.token)
}

export function loadAdminConfig() {
  const token = loadAdminToken()
  if (!token) return null
  return buildGithubConfig(token)
}

export function clearAdminConfig() {
  clearAdminToken()
}

function apiBase(cfg) {
  // 支持 GitHub Enterprise 自定义域名
  const base = cfg?.apiBase || 'https://api.github.com'
  return base.replace(/\/$/, '')
}

async function githubFetch(cfg, path, options = {}) {
  const url = apiBase(cfg) + path
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + cfg.token,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    let msg = res.status + ' ' + res.statusText
    try {
      const data = await res.json()
      if (data?.message) msg = data.message
    } catch {}
    throw new Error(msg)
  }
  return res
}

/** 读取一个文件的当前 sha，便于后续更新 */
export async function getFileSha(cfg, path) {
  try {
    const res = await githubFetch(
      cfg,
      `/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`,
      { method: 'GET' }
    )
    const data = await res.json()
    return data.sha || null
  } catch (e) {
    // 404 = 文件不存在（新建时不需要 sha）
    if (String(e.message).startsWith('404')) return null
    throw e
  }
}

/** 写单个文件（新建或更新） */
export async function writeFile(cfg, path, content, message) {
  const sha = await getFileSha(cfg, path)
  const body = {
    message: message || `chore(data): update ${path}`,
    branch: cfg.branch,
    content: b64encodeUnicode(content),
  }
  if (sha) body.sha = sha
  await githubFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return true
}

/** 批量写入多个文件。为了简单，逐个 PUT 即可，不需要 tree/commit 复杂度。 */
export async function writeFiles(cfg, files, message) {
  const commitMsg = message || 'chore(data): update site content'
  const results = {}
  for (const [path, content] of Object.entries(files)) {
    await writeFile(cfg, path, content, commitMsg)
    results[path] = 'ok'
  }
  return results
}

/** 验证 Token + 仓库权限是否有效 */
export async function verifyAccess(cfg) {
  const res = await githubFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}`, { method: 'GET' })
  const data = await res.json()
  const canPush = data?.permissions?.push ?? true // 公开仓库没权限字段不报错
  if (!canPush) throw new Error('Token 对该仓库没有 push 权限')
  return data
}

/** UTF-8 安全的 base64，GitHub API 要求 */
function b64encodeUnicode(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
