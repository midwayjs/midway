'use strict';

module.exports = {
  base: 'midway',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Midway',
      description: 'Full stack programming for the future'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Midway',
      description: '面向未来的全栈应用开发框架'
    }
  },
  themeConfig: {
    repo: 'midwayjs/midway',
    docsDir: 'docs',
    editLinks: true,
    lastUpdated: 'Last Updated',
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        editLinkText: 'Edit this page on GitHub',
        algolia: {},
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide' }
        ]
      },
      '/zh/': {
        // 多语言下拉菜单的标题
        selectText: '选择语言',
        // 该语言在下拉菜单中的标签
        label: '简体中文',
        // 编辑链接文字
        editLinkText: '在 GitHub 上编辑此页',
        // 当前 locale 的 algolia docsearch 选项
        algolia: {},
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '使用指南', link: '/zh/guide' }
        ]
      }
    }
  },
};
