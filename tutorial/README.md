# Midway.js 交互式教程

部署在 `https://midwayjs.org/tutorial/`。左侧是课程讲解，右侧通过 [StackBlitz SDK](https://developer.stackblitz.com/platform/api/javascript-sdk) 嵌入一个可运行的 Midway 项目（基于 WebContainer）。

这是一个独立的 Vite + React 项目，不属于仓库根目录的 pnpm workspace。

## 本地开发

```bash
cd tutorial
pnpm install --ignore-workspace
pnpm dev        # http://localhost:5180/tutorial/
pnpm build      # 输出到 dist/
pnpm verify     # 逐课编译并启动项目，检查预览路径是否有响应
```

## 目录结构

```
tutorial/
├── content/                 # 课程内容
│   └── <class|function>/<zh-cn|en>/
│       └── 1-getting-started/          # 章节，按数字前缀排序
│           ├── meta.md                 # 章节标题 + 导读
│           └── 2-first-controller/     # 一节课
│               ├── content.md          # 课程讲解
│               └── _files/             # 本课叠加在模板上的文件
├── templates/
│   ├── class/               # 装饰器风格的基础项目
│   └── function/            # 函数式风格的基础项目
├── build/                   # 构建期读取 content/ 的 Vite 插件
├── scripts/verify-lessons.ts
└── src/                     # 前端界面
```

每节课右侧的项目 = `templates/<风格>/` + 本课 `_files/`，同名文件以课程为准。课程之间互不继承，所以每节课的 `_files` 只需要放和模板不同的文件。

## 写一节新课

1. 在章节目录下新建 `<序号>-<slug>/`，目录名就是 URL 的一部分。
2. 写 `content.md`：

   ```md
   ---
   title: 创建第一个 Controller
   focus: /src/controller/home.controller.ts   # 进入课程时打开的文件
   preview: /                                  # 可选，预览窗口打开的路径，默认 /
   ---

   正文使用普通 Markdown，代码块会在构建时高亮。
   ```

3. 把本课需要的代码放进 `_files/`。
4. 运行 `pnpm verify` 确认能启动。

两种语言的目录结构保持一致，切换语言时会停留在同一节课。

## 部署注意

在线运行环境要求页面开启跨域隔离，`/tutorial/` 路径需要返回下面两个响应头，否则右侧会显示“在 StackBlitz 中打开”的兜底提示：

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

OSS 无法设置这两个头，需要在 Cloudflare 上用 Transform Rules（修改响应头）为 `/tutorial/` 路径添加。

模板的 `package.json` 或 `.npmrc` 变化时，右侧会重新创建环境并安装依赖；同一风格内切换课程只同步变化的文件，服务会自动重启。
