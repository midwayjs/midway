# 常见 git 问题

## 文件名大小写问题


由于 git 默认对大小写不敏感，如果文件名从小写变成了大写之后，无法发现文件有变化导致没有提交到仓库。


更可怕的是 mac 也是大小写不敏感，经常出现到本地可以运行，到服务器就执行错误的情况。


为此，我们最好把 git 的默认大小写关闭。


下面的命令。

```bash
$ git config core.ignorecase false													## 对当前项目生效
$ git config --global --add core.ignorecase false						## 对全局生效
```


## windows 下换行问题


在 Windows 上创建或者克隆代码，开发或者提交时，可能出现如下错误：

```
Delete `␍`eslint(prettier/prettier) 
```

原因如下：


由于历史原因，windows下和linux下的文本文件的换行符不一致。


- Windows在换行的时候，同时使用了回车符 CR(carriage-return character) 和换行符 LF(linefeed character) 
- 而Mac和Linux系统，仅仅使用了换行符 LF 
- 老版本的Mac系统使用的是回车符 CR 




| Windows | Linux/Mac | Old Mac(pre-OSX |
| --- | --- | --- |
| CRLF | LF | CR |
| '\n\r' | '\n' | '\r' |

因此，文本文件在不同系统下创建和使用时就会出现不兼容的问题。


解决方案如下：


设置全局 git 文本换行
```bash
$ git config --global core.autocrlf false
```
注意：git 全局配置之后，你需要重新拉取代码。


参考：

- [Delete `␍`eslint(prettier/prettier) 错误的解决方案](https://juejin.cn/post/6844904069304156168)
- [配置 Git 处理行结束符](https://docs.github.com/cn/github/getting-started-with-github/configuring-git-to-handle-line-endings)