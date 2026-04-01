# 首页布局梳理（用于重设计）

来源页面：[index.tsx](file:///Users/harry/project/open-midway-v3/site/src/pages/index.tsx)

## 顶层布局

- 外层：Docusaurus `Layout`
- 内容容器：首屏先隐藏，页面挂载后显示（用 `visibility: hidden/visible` 控制）
- 页面结构：由多个纵向堆叠的“全宽区块”组成；多数区块内容区域为居中容器（最大宽度约 1200px），两侧留白，移动端改为单列堆叠

## 区块顺序（从上到下）

1. 区块一：首屏 Hero（全屏）
2. 区块二：核心特性（3 张卡片）
3. 区块三：交互式教程预览（左右双卡）
4. 区块四：核心组件（图标 + 文案列表网格）
5. 区块五：应用案例（图片矩阵）
6. 区块六：推荐项目（推荐卡片）
7. 区块七：信任我们的团队（品牌跑马灯）
8. 区块八：底部收尾（Footer）

## 区块一：首屏 Hero（全屏居中 + 动态文本）

- **布局**
  - 全宽、最小高度占满一屏（接近 100vh）
  - 主要内容水平居中、垂直居中偏上，整体为“标题 + 副标题 + 入口按钮 + GitHub Star”纵向排列
  - 背景为主题色 + 径向渐变叠加，叠加大量装饰元素（气泡、几何图形、粒子）做浮动/旋转动画

- **内容/文本**
  - 主标题：`Midway`
  - 副标题固定前缀：`Node.js Framework For`
  - 副标题动态内容：在引号内循环切换（打字效果），候选词：
    - `Web / Fullstack / Architecture / API / Production / Microservice / Serverless / Speed / Efficiency / Developer / Experience`
  - 文档入口（两枚胶囊按钮）：
    - `📖 稳定版文档 (v3.x)` → `/docs/intro`
    - `🚧 Beta 版文档 (v4)` → `/docs/next/intro`
  - GitHub Star：嵌入 iframe（midwayjs/midway）
    - `https://ghbtns.com/github-btn.html?user=midwayjs&repo=midway&type=star&count=true&size=large`

## 区块二：核心特性（居中标题 + 三列卡片）

- **布局**
  - 全宽区块，浅色强调背景（带径向渐变）
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为卡片网格：桌面端 3 列，移动端单列堆叠
  - 中间卡片在视觉上更突出（略放大/更醒目）

- **内容/文本**
  - 区块标题：`核心特性`
  - 区块副标题：`专为现代 Node.js 应用设计，提供企业级的开发体验和性能表现`
  - 三张卡片（每张：图标 + 英文标题 + 描述）：
    1. `Reliable & Fast`
       - `Class + IoC = 更优雅的架构`
       - `Function + Hooks = 更高的研发效率`
    2. `API & Fullstack`
       - `不仅支持开发 API 服务，也提供业界首创的一体化全栈开发模式`
    3. `Progressive`
       - `渐进式设计，提供从基础到入门再到企业级的升级方案，解决应用维护与拓展性难题`

## 区块三：交互式教程预览（居中标题 + 左右双卡）

- **布局**
  - 全宽区块，浅色背景（带径向渐变）
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为左右双列两张卡片；移动端变为上下堆叠

- **内容/文本**
  - 区块标题：`🚧 交互式教程 (开发中)`
  - 区块副标题：`WebContainer 功能正在开发中，即将提供真实的开发环境体验，边学边练，快速掌握 Midway.js`
  - 左卡：`Class 语法教程`
    - 描述：`学习如何使用 Class 语法开发 Midway.js 应用`
    - 列表文案：
      - `基于装饰器的路由定义`
      - `依赖注入与服务管理`
      - `TypeORM 数据库集成`
      - `组件化开发模式`
    - 底部按钮：`🚧 即将开放`（不可点击状态）
  - 右卡：`Function 语法教程`
    - 描述：`学习如何使用 Function 语法开发 Midway.js 应用`
    - 列表文案：
      - `前后端一体化开发`
      - `函数式 API 设计`
      - `React Hooks 后端开发`
      - `零 API 调用模式`
    - 底部按钮：`🚧 即将开放`（不可点击状态）
  - 预期入口链接（当前为不可点击状态，仅记录原计划）：
    - Class：`/tutorials/class-syntax`
    - Function：`/tutorials/function-syntax`

## 区块四：核心组件（居中标题 + 列表网格）

- **布局**
  - 全宽区块，浅色背景
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为卡片列表网格：每张卡片为“左图标 + 右侧标题/描述”的横向排版
  - 桌面端为双列/多列自适应（最小列宽较大，整体偏大卡片）；移动端单列

- **内容/文本**
  - 区块标题：`核心组件`
  - 区块副标题：`提供丰富的企业级组件，满足各种开发需求，让开发更加高效`
  - 卡片（标题 / 描述 / 点击跳转链接）：
    - `ORM` / `TypeORM-based database SDK` → `/docs/extensions/orm`
    - `Redis` / `In-memory database for midway.js` → `/docs/extensions/redis`
    - `Swagger` / `Generate API documentation` → `/docs/extensions/swagger`
    - `Mongodb` / `NoSQL Database` → `/docs/extensions/mongodb`
    - `Cache` / `Memory cache support` → `/docs/extensions/cache`
    - `OSS` / `Aliyun OSS Support` → `/docs/extensions/oss`

## 区块五：应用案例（深色背景 + 图片矩阵）

- **布局**
  - 全宽区块，深色渐变背景
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为图片矩阵（自适应多列），每个图片项可点击打开新窗口

- **内容/文本**
  - 区块标题：`应用案例`
  - 区块副标题：`探索 Midway.js 在各种场景下的应用，了解其强大的适应性和灵活性`
  - 点击跳转：默认打开 `http://demo.midwayjs.org/`
  - 图片列表（15 张）：
    - `//gw.alicdn.com/imgextra/i4/19999999999999/O1CN01PEPPo02NjasvUe8cc_!!19999999999999-2-tps.png`
    - `//gw.alicdn.com/tfs/TB1Cdu2UYr1gK0jSZFDXXb9yVXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB18DKdjCR26e4jSZFEXXbwuXXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB11mzgg0Tfau8jSZFwXXX1mVXa-1200-669.png`
    - `//gw.alicdn.com/imgextra/i3/19999999999999/O1CN01HLo3Pi2NjasqFIZbi_!!19999999999999-2-tps.png`
    - `//gw.alicdn.com/imgextra/i2/19999999999999/O1CN01LggSYp2NjassPrZeZ_!!19999999999999-2-tps.png`
    - `//gw.alicdn.com/tfs/TB1l2LaU1L2gK0jSZFmXXc7iXXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB12AhMjcVl614jSZKPXXaGjpXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB1NtHPh5pE_u4jSZKbXXbCUVXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB1bonEgsieb18jSZFvXXaI3FXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB1Fh51U.Y1gK0jSZFMXXaWcVXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB1Ro.miMgP7K4jSZFqXXamhVXa-1200-669.png`
    - `//gw.alicdn.com/imgextra/i1/19999999999999/O1CN01FDOJdG2NjasvEbjxX_!!19999999999999-2-tps.png`
    - `//gw.alicdn.com/tfs/TB1MM_aU8r0gK0jSZFnXXbRRXXa-1200-669.png`
    - `//gw.alicdn.com/tfs/TB1Fuy3UYr1gK0jSZFDXXb9yVXa-1200-669.png`

## 区块六：推荐项目（浅色背景 + 推荐卡片）

- **布局**
  - 全宽区块，浅色渐变背景
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为推荐卡片（当前只有一项）；卡片为“整图展示”，hover 时出现覆盖层与标题

- **内容/文本**
  - 区块标题：`推荐项目`
  - 区块副标题：`来自开源社区的优秀扩展和项目，与 Midway.js 完美配合`
  - 推荐项：
    - `Cool js, 面向未来的后台开发框架`
    - 链接：`https://cool-js.com/`
    - 图片：`https://img.alicdn.com/imgextra/i3/O1CN01IZJkEY1bJrCKViAAc_!!6000000003445-2-tps-600-200.png`

## 区块七：信任我们的团队（浅色背景 + 横向跑马灯）

- **布局**
  - 全宽区块，浅色强调背景（带径向渐变），背景叠加少量浮动装饰元素
  - 顶部为居中标题区（标题 + 副标题）
  - 下方为品牌 Logo 的横向跑马灯（持续滚动），hover 时更清晰/更亮

- **内容/文本**
  - 区块标题：`信任我们的团队`
  - 区块副标题：`来自各大互联网公司的优秀团队都在使用 Midway.js，共同构建更好的应用`
  - Logo 列表：
    - iconfont（类名）：
      - `icon-tianmaotmall`
      - `icon-gaodeditu-quan`
      - `icon-feizhulogo`
      - `icon-credit_taobao_icon`
      - `icon-zijietiaodong`
      - `icon-dcaadaacdcabasvg`
      - `icon-is-aliyun_logo`
      - `icon-vivo`
    - 图片 URL：
      - `https://img.alicdn.com/imgextra/i3/O1CN015RbnOy1GX2fWWaBbs_!!6000000000631-2-tps-614-200.png`
      - `https://img.alicdn.com/imgextra/i4/O1CN01RpFMeb1LiYexaZIcP_!!6000000001333-2-tps-320-150.png`
      - `https://img.alicdn.com/imgextra/i3/O1CN010wn80L1UR01GSABXa_!!6000000002513-2-tps-277-121.png`
      - `https://img.alicdn.com/imgextra/i3/O1CN01vsbUzd1T9J6X9VBg7_!!6000000002339-2-tps-400-400.png`
      - `https://img.alicdn.com/imgextra/i1/O1CN01zw2fMc2266tFQCFQr_!!6000000007070-2-tps-704-255.png`
      - `https://img.alicdn.com/imgextra/i4/O1CN01RiM9ex1hyycitrJHV_!!6000000004347-2-tps-890-310.png`

## 区块八：底部收尾（深色背景 + 居中文案）

- **布局**
  - 全宽 footer，深色渐变背景，居中对齐
  - 文案为“标题 + 一句话”纵向排列，背景有轻微装饰浮动元素

- **内容/文本**
  - 链接区（四列）：
    - Learn
      - `Introduction` → `docs/intro`
      - `Quick Start` → `docs/quick_guide`
      - `Migration from v2 to v3` → `docs/upgrade_v3`
    - Community
      - `Bilibili` → `https://space.bilibili.com/1746017680`
      - `Zhihu` → `https://zhuanlan.zhihu.com/midwayjs`
    - More
      - `Blog` → `blog`
      - `Changelog` → `/changelog`
      - `GitHub Issue` → `https://github.com/midwayjs/midway`
    - Link
      - `Taobao FED` → `https://fed.taobao.org/`
      - `ICE` → `https://ice.work/`
      - `CNode` → `https://cnodejs.org/`
  - 版权信息：`Copyright © {current year} MidwayJS. Built with Docusaurus.`
