// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Midway',
  tagline: 'Midway is a fullstack framework for web & Serverless',
  url: 'https://midwayjs.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'midwayjs', // Usually your GitHub org/user name.
  projectName: 'midway', // Usually your repo name.
  stylesheets: ['//at.alicdn.com/t/font_2797741_dnh1sm1jan.css'],
  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn', 'en'],
  },
  plugins: [
    [
      require.resolve('./src/plugins/changelog/index.js'),
      {
        blogTitle: 'Midway changelog',
        blogDescription:
          'Keep yourself up-to-date about new features in every release',
        blogSidebarCount: 'ALL',
        blogSidebarTitle: 'Changelog',
        routeBasePath: '/changelog',
        showReadingTime: false,
        postsPerPage: 20,
        archiveBasePath: null,
        authorsMapPath: 'authors.json',
        feedOptions: {
          type: 'all',
          title: 'Midway changelog',
          description:
            'Keep yourself up-to-date about new features in every release',
          copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc.`,
          language: 'en',
        },
      },
    ],
    './lib/plugin.js'
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./docs/sidebars.json'),
          // Please change this to your repo.
          editUrl: 'https://github.com/midwayjs/midway/tree/main/site/',
          versions: {
            current: {
              label: '3.0.0',
            },
          },
          lastVersion: 'current',
          sidebarCollapsed: false,
        },
        blog: {
          // routeBasePath: '/',
          path: 'blog',
          postsPerPage: 5,
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All our posts',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      favicon: 'img/logo.svg',
      metadata: [
        {
          name: 'referrer',
          content: 'no-referrer',
        },
      ],
      navbar: {
        title: 'Midway',
        logo: {
          alt: 'midway logo',
          src: 'img/logo.svg',
        },
        hideOnScroll: true,
        items: [
          ...require('./lib/navbar'),
          {
            type: 'docsVersionDropdown',
            dropdownActiveClassDisabled: true,
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            type: 'dropdown',
            label: '社区活动',
            position: 'right',
            items: [
              {
                label: '开源送礼',
                href: 'https://survey.taobao.com/apps/zhiliao/pJ3zng9Iv',
              },
              {
                label: '线下沙龙',
                href: 'https://subway.midwayjs.org/',
              },
            ],
          },
          {
            href: 'https://github.com/midwayjs/midway',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      algolia: {
        appId: 'DHOMYJQQ2W',
        apiKey: '75f3dce231a9777ae8fa6fba6b82085b',
        indexName: 'midway',
        contextualSearch: true,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Introduction',
                to: 'docs/intro',
              },
              {
                label: 'Quick Start',
                to: 'docs/quick_guide',
              },
              {
                label: 'Migration from v2 to v3',
                to: 'docs/upgrade_v3',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Bilibili',
                href: 'https://space.bilibili.com/1746017680',
              },
              {
                label: 'Zhihu',
                to: 'https://zhuanlan.zhihu.com/midwayjs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'blog',
              },
              {
                label: 'Changelog',
                to: '/changelog',
              },
              {
                label: 'GitHub Issue',
                href: 'https://github.com/midwayjs/midway',
              },
              // {
              //   label: 'Twitter',
              //   href: 'https://twitter.com/docusaurus',
              // },
            ],
          },
          {
            title: 'Link',
            items: [
              {
                label: 'Taobao FED',
                href: 'https://fed.taobao.org/',
              },
              {
                label: 'ICE',
                href: 'https://ice.work/',
              },
              {
                label: 'CNode',
                href: 'https://cnodejs.org/',
              },
            ],
          },
        ],
        // logo: {
        //   alt: 'Alibaba Open Source Logo',
        //   src: 'https://img.alicdn.com/imgextra/i1/O1CN014B9spq1xrDad6enpX_!!6000000006496-2-tps-240-58.png',
        //   href: 'https://opensource.alibaba.com/',
        // },
        copyright: `Copyright © ${new Date().getFullYear()} Alibaba Group. Built with Docusaurus.`,
      },
    }),
};

module.exports = config;
