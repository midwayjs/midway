# npm 镜像源配置说明

## 🎯 目的

为了加速国内用户的 `npm install` 速度，统一配置使用淘宝 npm 镜像源。

## 📁 配置位置

### 1. 模板中的配置
```
templates/default/.npmrc
```

所有课程（第二课及以后）都会继承这个配置。

### 2. 第一课中的配置
```
1-getting-started/1-project-structure/_files/.npmrc
```

第一课因为展示完整结构，有自己的 `.npmrc` 文件。

## 📝 配置内容

```
registry=https://registry.npmmirror.com
```

## 🔄 工作原理

### WebContainer 环境中的 npm

当学生运行 `npm install` 时：

1. WebContainer 读取项目根目录的 `.npmrc`
2. 使用配置的镜像源下载依赖
3. 加速国内访问速度

### 文件继承

```
第一课：
  使用 _files/.npmrc ✅（可见）

第二课及以后：
  使用 templates/default/.npmrc ✅（不可见但生效）
```

## ✅ 优势

1. **统一配置** - 所有课程使用相同的镜像源
2. **加速下载** - 国内镜像速度更快
3. **自动生效** - 学生无需手动配置
4. **透明化** - 在文件树中可见（第一课）

## 🎓 学生体验

### 第一课（静态展示）
- 可以在文件树中看到 `.npmrc`
- 了解 npm 配置文件的作用

### 第二课及以后（动态运行）
- `.npmrc` 存在但不显示（模板提供）
- `npm install` 自动使用淘宝镜像
- 下载速度明显提升

## 📊 镜像源信息

- **官方源**: `https://registry.npmjs.org`
- **淘宝镜像**: `https://registry.npmmirror.com`（原 `https://registry.npm.taobao.org`）

淘宝镜像特点：
- ✅ 每 10 分钟同步一次
- ✅ 国内 CDN 加速
- ✅ 稳定可靠

## 🔧 其他配置选项

如果需要，可以添加更多配置：

```
# 设置镜像源
registry=https://registry.npmmirror.com

# 禁用 package-lock.json
package-lock=false

# 设置超时时间
timeout=60000

# 禁用进度条（在 CI 环境中有用）
progress=false
```

## ✅ 验证

学生可以在终端中看到：

```bash
npm install
# 下载速度明显提升
# 控制台会显示从淘宝镜像下载
```

## 📝 注意事项

1. `.npmrc` 文件会被 TutorialKit 自动复制到 WebContainer
2. 模板的 `.npmrc` 对所有课程生效（除了第一课）
3. 如果学生本地也有 `.npmrc`，WebContainer 中的配置不影响本地

## 🎉 总结

通过在模板和第一课中添加 `.npmrc` 文件：
- ✅ 所有课程统一使用淘宝镜像
- ✅ 国内用户下载速度大幅提升
- ✅ 学生无需手动配置
- ✅ 第一课展示了配置文件的作用
