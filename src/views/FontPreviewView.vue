<script setup>
const samples = [
  {
    id: 'noto-sans',
    name: '思源黑体 · Noto Sans SC',
    tag: '清晰中性',
    desc: '最稳妥的正文选择。笔画均匀、识别度高，长文阅读不累，和 Syne 英文搭在一起很干净。',
    family: "'Noto Sans SC', sans-serif",
  },
  {
    id: 'noto-serif',
    name: '思源宋体 · Noto Serif SC',
    tag: '书卷质感',
    desc: '标题感更强，带一点纸质书的温度。适合 About、Blog 标题；正文用可能略正式。',
    family: "'Noto Serif SC', serif",
  },
  {
    id: 'lxgw-wenkai',
    name: '霞鹜文楷 · LXGW WenKai',
    tag: '温润手写',
    desc: '个人站里很受欢迎。楷体韵味、不过分张扬，朗读/信件/博客都很有温度。',
    family: "'LXGW WenKai', serif",
  },
  {
    id: 'lxgw-neoxihei',
    name: '霞鹜新晰黑 · LXGW Neo XiHei',
    tag: '柔和现代',
    desc: '比思源黑体更软、更有人味，但仍保持清晰。想「现代但不冷」可以选它。',
    family: "'LXGW Neo XiHei', sans-serif",
  },
  {
    id: 'zcool-xiaowei',
    name: '站酷小薇体 · ZCOOL XiaoWei',
    tag: '纤细文艺',
    desc: '线条轻盈，适合短句、标题、引语。正文大面积使用会偏细，更适合点缀。',
    family: "'ZCOOL XiaoWei', serif",
  },
  {
    id: 'ma-shan-zheng',
    name: '马善政 · Ma Shan Zheng',
    tag: '毛笔装饰',
    desc: '书法感最强，适合极少数标题或彩蛋文案。不建议用于正文和导航。',
    family: "'Ma Shan Zheng', cursive",
  },
]

const leadEn = 'Just Rejoice Journey'
const leadZh = '只管欣然，奔赴前路'
const body =
  '我是 Electronic，偶尔写点记录。这个站不追求热闹，安静、清楚，随时能回来翻一翻。博客里是想法和笔记；Kids 角从孕期胎教开始——朗读、静心、想对宝宝说的话。'
</script>

<template>
  <section class="view-frame preview">
    <p class="kicker"><span>字体</span> Preview</p>
    <h1>中文字体参考</h1>
    <p class="intro">
      英文继续用 Syne。下面每块是同一段站点文案，换不同中文字体渲染——选好之后告诉我编号或名字就行。
    </p>

    <div class="grid">
      <article v-for="(font, i) in samples" :key="font.id" class="card panel">
        <header class="card-hd">
          <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
          <div>
            <h2>{{ font.name }}</h2>
            <span class="tag">{{ font.tag }}</span>
          </div>
        </header>
        <p class="desc">{{ font.desc }}</p>

        <div class="sample" :style="{ fontFamily: font.family }">
          <p class="sample-en">{{ leadEn }}</p>
          <p class="sample-zh">{{ leadZh }}</p>
          <p class="sample-body">{{ body }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.preview h1 {
  margin: 0.6rem 0 0.5rem;
  font-family: var(--font-home-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
}

.intro {
  margin: 0 0 2rem;
  max-width: 52ch;
  opacity: 0.78;
  line-height: 1.75;
}

.grid {
  display: grid;
  gap: 1.25rem;
}

.card {
  padding: 1.25rem 1.2rem 1.35rem;
}

.card-hd {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 0.65rem;
}

.idx {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--warm);
  padding-top: 0.2rem;
}

.card h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--ice-bright);
}

.tag {
  display: inline-block;
  margin-top: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: var(--ice);
  opacity: 0.8;
}

.desc {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  line-height: 1.65;
  opacity: 0.72;
}

.sample {
  padding-top: 0.85rem;
  border-top: 1px solid var(--line);
}

.sample-en {
  margin: 0 0 0.15rem;
  font-family: var(--font-home-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.15;
}

.sample-zh {
  margin: 0 0 0.85rem;
  font-size: 1.35rem;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.04em;
}

.sample-body {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.85;
  color: rgba(200, 214, 220, 0.9);
}
</style>

<style>
@import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css');
@import url('https://cdn.jsdelivr.net/npm/lxgw-neoxihei-webfont@0.3.3/style.css');
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&display=swap');
</style>
