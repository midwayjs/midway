module.exports = {
  title: 'Midway Faas',
  description: 'Midway Faas make serverless easy.',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '使用方法', link: '/guide/' },
      {
        text: 'MidwayJs 系列产品',
        items: [
          {
            text: '框架',
            items: [
              {
                text: 'Midway - 面向未来的 Web 全栈框架',
                link: 'http://midwayjs.org/midway',
              },
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
            items: [{ text: 'Sandbox - 私有化 Node.js 监控产品', link: '#' }],
          },
          {
            text: 'Node.js 依赖注入模块',
            items: [
              {
                text: 'Injection - 让你的应用用上 IoC，体验依赖注入的感觉',
                link: 'http://midwayjs.org/injection',
              },
            ],
          },
          {
            text: 'Midway Faas Serverless开发框架',
            items: [
              {
                text: 'Serverless - 提供更便捷的Serverless开发体验',
                link: '/',
              },
            ],
          },
        ],
      },
      {
        text: 'Github',
        link: 'https://github.com/midwayjs/midway-faas',
        target: '_blank',
      },
    ],
  },
};
