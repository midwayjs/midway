# 验证 npm 镜像源配置

## 🧪 验证方法

### 方法 1：访问教程并查看第二课的终端输出

1. **启动教程服务器**
   ```bash
   cd /Users/harry/project/open-midway-v3/tutorial
   pnpm dev
   ```

2. **访问第二课**
   ```
   http://localhost:4322/1-getting-started/2-first-controller
   ```

3. **观察终端输出**
   
   当 `npm install` 运行时，查看下载地址：
   
   ✅ **使用淘宝镜像（正确）**：
   ```
   npm http fetch GET 200 https://registry.npmmirror.com/@midwayjs/core/-/core-3.16.0.tgz
   npm http fetch GET 200 https://registry.npmmirror.com/@midwayjs/decorator/-/decorator-3.16.0.tgz
   ```
   
   ❌ **使用官方源（未生效）**：
   ```
   npm http fetch GET 200 https://registry.npmjs.org/@midwayjs/core/-/core-3.16.0.tgz
   ```

### 方法 2：在 WebContainer 终端中检查配置

如果教程支持交互式终端，可以在终端中运行：

```bash
# 查看当前使用的 registry
npm config get registry

# 应该输出：
https://registry.npmmirror.com
```

或者：

```bash
# 查看 .npmrc 文件
cat .npmrc

# 应该输出：
registry=https://registry.npmmirror.com
```

### 方法 3：对比下载速度

**官方源（慢）**：
- 初始化耗时：~30-60 秒
- 下载速度：几十 KB/s

**淘宝镜像（快）**：
- 初始化耗时：~5-15 秒
- 下载速度：几 MB/s

## 📊 实际测试

### 第一课（静态展示）
```
访问：http://localhost:4322/1-getting-started/1-project-structure

预期：
- 可以在文件树中看到 .npmrc 文件
- 点击查看内容：registry=https://registry.npmmirror.com
- 不会运行 npm install
```

### 第二课（动态运行）
```
访问：http://localhost:4322/1-getting-started/2-first-controller

预期：
1. 看到 "Preparing Environment"
2. 终端显示 "npm install" 输出
3. 下载地址包含 "registry.npmmirror.com"
4. 安装速度明显快于官方源
```

## 🔍 检查生成的文件

TutorialKit 会生成模板的 JSON 文件，可以检查：

```bash
# 查看生成的模板配置
cat .tutorialkit/cache/template-default.json

# 应该包含 .npmrc 文件
```

## ✅ 验证清单

- [ ] 第一课文件树中显示 `.npmrc`
- [ ] `.npmrc` 内容为 `registry=https://registry.npmmirror.com`
- [ ] 第二课终端显示从淘宝镜像下载
- [ ] 下载速度明显提升（< 15 秒完成安装）
- [ ] npm install 没有错误

## 🐛 如果没有生效

### 检查 1：确认文件存在
```bash
# 检查模板
ls -la tutorial/src/templates/default/.npmrc

# 检查第一课
ls -la tutorial/src/content/tutorial/1-getting-started/1-project-structure/_files/.npmrc
```

### 检查 2：确认文件内容
```bash
cat tutorial/src/templates/default/.npmrc
# 应该输出：registry=https://registry.npmmirror.com
```

### 检查 3：清除缓存重试
```bash
# 清除 TutorialKit 缓存
rm -rf tutorial/.tutorialkit/cache

# 重启服务器
cd tutorial
pnpm dev
```

### 检查 4：查看浏览器控制台
打开浏览器开发者工具，查看是否有相关错误信息。

## 📝 注意事项

1. **WebContainer 限制**
   - WebContainer 中的 npm 行为可能与本地略有不同
   - 某些情况下可能需要清除缓存

2. **首次加载**
   - 第一次运行可能需要初始化 WebContainer
   - 后续课程会复用已下载的依赖

3. **网络环境**
   - 如果在国外访问，淘宝镜像可能不如官方源快
   - 可以考虑根据地区使用不同配置

## 🎯 成功标志

当你看到以下情况时，说明配置已生效：

✅ 终端输出包含 `registry.npmmirror.com`  
✅ npm install 完成时间 < 15 秒  
✅ 没有超时或连接错误  
✅ 所有依赖成功安装  
✅ 应用正常启动在 7001 端口
