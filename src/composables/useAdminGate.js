/**
 * Admin 页面入口密码门禁。
 * 纯前端防护：防爬虫与随手试探，不能替代服务端鉴权。
 * 失败次数与锁定状态存 localStorage；通过后 sessionStorage 维持本次会话。
 */

const GATE_KEY = 'admin_gate_ok'
const LOCKOUT_KEY = 'admin_gate_lockout'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30 * 60 * 1000 // 30 分钟
const MIN_INTERVAL_MS = 1500 // 两次尝试最短间隔，拖慢暴力枚举

/** SHA-256("950926") */
const PASS_HASH = '1492d0ab9d139c12205a428c9a948b6346f3143b03d8008c3aef949cbf0120fa'

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readLockout() {
  const raw = localStorage.getItem(LOCKOUT_KEY)
  if (!raw) return { attempts: 0, lockedUntil: 0, lastAttempt: 0 }
  try {
    const data = JSON.parse(raw)
    if (data.lockedUntil && Date.now() >= data.lockedUntil) {
      localStorage.removeItem(LOCKOUT_KEY)
      return { attempts: 0, lockedUntil: 0, lastAttempt: 0 }
    }
    return {
      attempts: data.attempts || 0,
      lockedUntil: data.lockedUntil || 0,
      lastAttempt: data.lastAttempt || 0,
    }
  } catch {
    return { attempts: 0, lockedUntil: 0, lastAttempt: 0 }
  }
}

function writeLockout(data) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data))
}

export function isGateOpen() {
  return sessionStorage.getItem(GATE_KEY) === '1'
}

export function openGate() {
  sessionStorage.setItem(GATE_KEY, '1')
}

export function closeGate() {
  sessionStorage.removeItem(GATE_KEY)
}

/** 当前锁定与剩余尝试次数，供 UI 展示 */
export function getGateStatus() {
  const { attempts, lockedUntil } = readLockout()
  if (lockedUntil && Date.now() < lockedUntil) {
    return {
      locked: true,
      attempts,
      remaining: 0,
      lockedUntil,
      waitMs: lockedUntil - Date.now(),
    }
  }
  return {
    locked: false,
    attempts,
    remaining: MAX_ATTEMPTS - attempts,
    lockedUntil: 0,
    waitMs: 0,
  }
}

export async function verifyGatePassword(password) {
  const state = readLockout()

  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    const min = Math.ceil((state.lockedUntil - Date.now()) / 60000)
    throw new Error(`尝试次数过多，请 ${min} 分钟后再试`)
  }

  const sinceLast = Date.now() - state.lastAttempt
  if (state.lastAttempt && sinceLast < MIN_INTERVAL_MS) {
    const sec = Math.ceil((MIN_INTERVAL_MS - sinceLast) / 1000)
    throw new Error(`请稍候 ${sec} 秒后再试`)
  }

  const hash = await sha256(password)
  if (hash === PASS_HASH) {
    localStorage.removeItem(LOCKOUT_KEY)
    openGate()
    return true
  }

  const attempts = state.attempts + 1
  const now = Date.now()

  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS
    writeLockout({ attempts, lockedUntil, lastAttempt: now })
    throw new Error('密码错误次数过多，已锁定 30 分钟')
  }

  writeLockout({ attempts, lockedUntil: 0, lastAttempt: now })
  const remaining = MAX_ATTEMPTS - attempts
  throw new Error(`密码错误，还可尝试 ${remaining} 次`)
}
