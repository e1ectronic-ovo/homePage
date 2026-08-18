import { ref } from 'vue'
import profileData from '../data/profile.json'
import projectsData from '../data/projects.json'
import toolsData from '../data/tools.json'
import postsData from '../data/posts.json'
import kidsData from '../data/kids.json'

// 运行时可变的数据副本（后台编辑时修改这里，提交后刷新页面才真正从 JSON 重新 import）
export const profile = ref({ ...profileData, about: { ...profileData.about } })
export const projects = ref([...projectsData])
export const tools = ref([...toolsData])
export const posts = ref([...postsData])
export const kids = ref([...kidsData])

export function getAllData() {
  return {
    'src/data/profile.json': JSON.stringify(profile.value, null, 2) + '\n',
    'src/data/projects.json': JSON.stringify(projects.value, null, 2) + '\n',
    'src/data/tools.json': JSON.stringify(tools.value, null, 2) + '\n',
    'src/data/posts.json': JSON.stringify(posts.value, null, 2) + '\n',
    'src/data/kids.json': JSON.stringify(kids.value, null, 2) + '\n',
  }
}

export function getTool(id) {
  return tools.value.find((t) => t.id === id) ?? null
}

export function getPost(id) {
  return posts.value.find((p) => p.id === id) ?? null
}

export function getKid(id) {
  return kids.value.find((k) => k.id === id) ?? null
}

export function latestPosts(limit = 3) {
  return [...posts.value]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

export function onlineProjects() {
  return projects.value.filter((p) => p.status !== 'offline')
}

export function onlineTools() {
  return tools.value.filter((t) => t.status === 'online')
}
