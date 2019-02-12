'use strict';

module.exports = {
  base: '/midway/',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Midway',
      description: '面向未来的 Web 全栈应用开发框架',
    },
    '/en/': {
      lang: 'en-US',
      title: 'Midway',
      description: 'Future oriented full-stack web framework',
    },
  },
  themeConfig: {
    locales: {
      '/': {
        lang: 'zh-CN',
        title: 'Midway',
        description: '面向未来的 Web 全栈应用开发框架',
        repo: 'midwayjs/midway',
        docsDir: 'docs',
        editLinks: true,
        serviceWorker: {
          updatePopup: true,
        },
        nav: [
          { text: '首页', link: '/' },
          { text: '使用文档', link: '/guide' },
          { text: '依赖注入手册', link: '/ioc' },
          { text: '工具集', link: '/tool_set' },
          { text: 'TS 新手指南', link: '/ts_start' },
          {
            text: 'API',
            link: 'http://www.midwayjs.org/midway/api-reference/globals.html',
          },
          {
            text: 'MidwayJs 系列产品',
            items: [
              {
                text: '框架',
                items: [
                  { text: 'Midway - 面向未来的 Web 全栈框架', link: '/' },
                ],
              },
              {
                text: '应用管理',
                items: [
                  {
                    text: 'Pandora.js - Node.js 应用管理器',
                    link: 'http://midwayjs.org/pandora/',
                  },
                ],
              },
              {
                text: '监控产品',
                items: [
                  { text: 'Sandbox - 私有化 Node.js 监控产品', link: '#' },
                ],
              },
            ],
          },
        ],
      },
      '/en/': {
        lang: 'en-US',
        title: 'Midway',
        description: 'Future oriented full-stack Web framework',
        repo: 'midwayjs/midway',
        docsDir: 'docs',
        editLinks: true,
        serviceWorker: {
          updatePopup: true,
        },
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide' },
          { text: 'IoC', link: '/en/ioc' },
          { text: 'Toolkit', link: '/en/tool_set' },
          { text: 'TS Guide', link: '/en/ts_start' },
          {
            text: 'API',
            link: 'http://www.midwayjs.org/midway/api-reference/globals.html',
          },
          {
            text: 'MidwayJs Team',
            items: [
              {
                text: 'Framework',
                items: [
                  {
                    text: 'Midway - Future oriented Web framework',
                    link: '/en/',
                  },
                ],
              },
              {
                text: 'Application Manger',
                items: [
                  {
                    text: 'Pandora.js - Node.js Application Manager',
                    link: 'http://midwayjs.org/pandora/',
                  },
                ],
              },
              {
                text: 'Monitoring',
                items: [{ text: 'Sandbox - Private Node.js APM', link: '#' }],
              },
            ],
          },
        ],
      },
    },
  },
  lastUpdated: 'Last Updated',
};
