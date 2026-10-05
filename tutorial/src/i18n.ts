import type { Locale, Track } from './types';

const zh = {
  brand: '教程',
  heroEyebrow: '交互式教程 · 浏览器内运行',
  heroTitleA: '边写边跑，',
  heroTitleB: '上手 Midway.js',
  heroDesc:
    '无需安装任何东西。左边读讲解，右边直接改代码，服务在浏览器里实时重启，预览窗口里马上看到结果。',
  chooseTrack: '选择一种写法开始',
  lessons: (n: number) => `${n} 节课`,
  start: '开始学习',
  howTitle: '怎么学',
  how: [
    { title: '读讲解', desc: '每节课只讲一个概念，配完整可运行的代码。' },
    { title: '改代码', desc: '右侧是完整的编辑器和终端，改动保存后服务自动重启。' },
    { title: '看结果', desc: '内置预览窗口带地址栏，可以直接访问你写的接口。' },
  ],
  browserNote: '推荐使用桌面版 Chrome 或 Edge，Safari 和 Firefox 的在线运行环境支持有限。',
  lessonOf: (i: number, n: number) => `第 ${i} / ${n} 课`,
  prev: '上一课',
  next: '下一课',
  finish: '完成教程，去看文档',
  partIntro: '本章导读',
  outline: '课程目录',
  reset: '重置代码',
  resetTip: '把编辑器里的文件恢复成本课的初始状态',
  openInStackBlitz: '在 StackBlitz 中打开',
  docs: '文档',
  switchLocale: 'English',
  theme: '切换主题',
  loading: '正在加载课程…',
  booting: '正在启动在线环境…',
  isolationTitle: '当前页面无法嵌入在线运行环境',
  isolationDesc:
    '在线运行环境基于 WebContainer，需要页面开启跨域隔离（COOP / COEP 响应头）。你可以在新窗口中打开本课的完整项目继续学习。',
  notFound: '没有找到这节课',
  backHome: '回到教程首页',
};

type Dict = typeof zh;

const en: Dict = {
  brand: 'Tutorial',
  heroEyebrow: 'Interactive tutorial · Runs in your browser',
  heroTitleA: 'Learn Midway.js ',
  heroTitleB: 'by building',
  heroDesc:
    'Nothing to install. Read on the left, edit real code on the right — the server restarts in your browser and the preview updates instantly.',
  chooseTrack: 'Pick a style to start',
  lessons: (n: number) => `${n} lessons`,
  start: 'Start learning',
  howTitle: 'How it works',
  how: [
    { title: 'Read', desc: 'Each lesson focuses on one concept with complete, runnable code.' },
    { title: 'Edit', desc: 'A full editor and terminal on the right. Save and the server restarts.' },
    { title: 'Verify', desc: 'The built-in preview has an address bar, so you can hit your own routes.' },
  ],
  browserNote:
    'Desktop Chrome or Edge is recommended. Safari and Firefox have limited support for the in-browser runtime.',
  lessonOf: (i: number, n: number) => `Lesson ${i} of ${n}`,
  prev: 'Previous',
  next: 'Next',
  finish: 'Done! Continue with the docs',
  partIntro: 'Chapter overview',
  outline: 'Contents',
  reset: 'Reset code',
  resetTip: 'Restore the files to the starting point of this lesson',
  openInStackBlitz: 'Open in StackBlitz',
  docs: 'Docs',
  switchLocale: '中文',
  theme: 'Toggle theme',
  loading: 'Loading lesson…',
  booting: 'Starting the runtime…',
  isolationTitle: 'The runtime cannot be embedded on this page',
  isolationDesc:
    'The in-browser runtime is powered by WebContainer and requires cross-origin isolation (COOP / COEP headers). You can open the full project for this lesson in a new window instead.',
  notFound: 'Lesson not found',
  backHome: 'Back to tutorial home',
};

export const messages: Record<Locale, Dict> = { 'zh-cn': zh, en };

/** 两种写法的展示信息。 */
export const trackInfo: Record<Track, Record<Locale, { name: string; short: string; desc: string }>> = {
  class: {
    'zh-cn': {
      name: '装饰器风格',
      short: '装饰器',
      desc: '用 @Controller、@Inject 等装饰器组织代码，结构清晰，适合熟悉面向对象或 Spring / NestJS 的同学。',
    },
    en: {
      name: 'Decorator style',
      short: 'Decorators',
      desc: 'Organize code with @Controller, @Inject and friends. Familiar if you come from OOP, Spring or NestJS.',
    },
  },
  function: {
    'zh-cn': {
      name: '函数式风格',
      short: '函数式',
      desc: '用 defineApi、useInject 契约先行地编写接口，类型从服务端一路贯通到前端调用。',
    },
    en: {
      name: 'Functional style',
      short: 'Functional',
      desc: 'Contract-first APIs with defineApi and useInject, with types flowing from server to client.',
    },
  },
};

export const DOCS_URL: Record<Locale, string> = {
  'zh-cn': 'https://midwayjs.org/docs/quickstart',
  en: 'https://midwayjs.org/en/docs/quickstart',
};

export const GITHUB_URL = 'https://github.com/midwayjs/midway';
