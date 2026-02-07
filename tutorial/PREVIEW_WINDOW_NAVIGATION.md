# TutorialKit 预览窗口说明

## ⚠️ 重要发现

TutorialKit 的预览窗口是一个 **iframe**，**默认没有地址栏**！

## 🎯 实际情况

### 预览窗口的限制

```
┌─────────────────────────────┐
│  预览窗口（iframe）         │
│                             │
│  ❌ 没有地址栏              │
│  ❌ 不能直接输入 URL        │
│  ✅ 只显示默认页面          │
└─────────────────────────────┘
```

预览窗口会自动加载：
- 第一次：`http://localhost:7001/`（默认路由）
- 代码修改后：自动刷新同一页面

## 💡 解决方案

### 方案 1：在应用中添加导航链接（推荐）

修改 Controller 返回 HTML 页面，包含测试链接：

```typescript
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return `
      <h1>Midway 教程 - API 测试</h1>
      <h2>可用的 API 接口：</h2>
      <ul>
        <li><a href="/api/users">GET /api/users - 获取所有用户</a></li>
        <li><a href="/api/users/1">GET /api/users/1 - 获取用户 1</a></li>
        <li><a href="/api/users/search?keyword=张">GET /api/users/search?keyword=张 - 搜索用户</a></li>
      </ul>
    `;
  }
}
```

学生可以点击链接访问不同的 API！

### 方案 2：提供默认路由返回所有可用接口

```typescript
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      message: '欢迎使用 Midway 教程',
      availableApis: [
        { method: 'GET', path: '/api/users', description: '获取所有用户' },
        { method: 'GET', path: '/api/users/:id', description: '获取单个用户' },
        { method: 'GET', path: '/api/users/search?keyword=xxx', description: '搜索用户' }
      ]
    };
  }
}
```

### 方案 3：使用 "在新标签页打开" 功能

TutorialKit 的预览窗口可能有一个 **"在新标签页打开"** 按钮：

```
预览窗口右上角 → 📤 按钮 → 在新标签页打开
```

在新标签页中，学生就可以：
- ✅ 看到完整的浏览器地址栏
- ✅ 手动输入不同的 URL
- ✅ 使用浏览器的开发者工具

## 🎓 教学建议

### 当前最佳实践：提供导航页面

为每个需要测试 API 的课程创建一个首页导航：

```typescript
// home.controller.ts
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Midway 教程</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          a { display: block; margin: 10px 0; color: #0066cc; }
          a:hover { color: #0099ff; }
        </style>
      </head>
      <body>
        <h1>第五课：依赖注入的使用</h1>
        <h2>测试以下 API 接口：</h2>
        <ul>
          <li><a href="/api/users">获取所有用户</a></li>
          <li><a href="/api/users/1">获取用户 1</a></li>
          <li><a href="/api/users/2">获取用户 2</a></li>
          <li><a href="/api/users/search?keyword=张">搜索"张"</a></li>
          <li><a href="/api/users/search?keyword=李">搜索"李"</a></li>
        </ul>
      </body>
      </html>
    `;
  }
}
```

### 文档中的说明调整

不要说"在地址栏输入"，而是：

```markdown
## 测试 API

点击以下链接测试接口：

- [获取所有用户](/api/users)
- [获取用户 1](/api/users/1)
- [搜索用户](/api/users/search?keyword=张)

或者在预览窗口右上角点击"在新标签页打开"按钮，
然后在浏览器地址栏中输入不同的路径。
```

## 📋 需要调整的内容

### 第五课需要修改

1. **添加导航页面**
   - 修改 `home.controller.ts` 返回 HTML
   - 包含所有测试链接

2. **更新文档说明**
   - 删除"在地址栏输入"的说法
   - 改为"点击链接"或"在新标签页打开"

3. **聚焦文件调整**
   - 可以考虑让首页成为焦点
   - 或者在文档中明确说明导航方式

## ✅ 总结

**TutorialKit 预览窗口没有地址栏**，但我们可以：

1. ✅ 在应用中添加导航链接
2. ✅ 提供 HTML 页面作为导航入口
3. ✅ 引导学生使用"在新标签页打开"
4. ✅ 返回 JSON 列出可用的 API

推荐使用**方案 1**：提供一个 HTML 导航页面，最直观！
