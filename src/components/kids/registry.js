/** Kids 互动页：id 与 kids.json 里的 id 对应 */
export const kidModules = {
  stories: () => import('./PrenatalStories.vue'),
  'quiet-breath': () => import('./QuietBreath.vue'),
  'first-letter': () => import('./FirstLetter.vue'),
}

export function hasKidModule(id) {
  return id in kidModules
}
