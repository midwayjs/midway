---
title: TypeORM Model Generator
---

感谢社区用户 @youtiao66 提供此模块。
​

通过该工具，你可以快速创建 for Midway 的 TypeORM Model。
​

## 使用

比如生成 mysql 的 model。

```bash
# 推荐
# 请替换配置信息
$ npx mdl-gen-midway -h localhost -p 3306 -d yourdbname -u root -x yourpassword -e mysql --noConfig --case-property none
```

完整参数：

```
Usage: npx mdl-gen-midway -h <host> -d <database> -p [port] -u <user> -x
[password] -e [engine]

Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  -h, --host             IP address/Hostname for database server
                                                          [default: "127.0.0.1"]
  -d, --database         Database name(or path for sqlite)            [required]
  -u, --user             Username for database server
  -x, --pass             Password for database server              [default: ""]
  -p, --port             Port number for database server
  -e, --engine           Database engine
          [choices: "mssql", "postgres", "mysql", "mariadb", "oracle", "sqlite"]
                                                              [default: "mssql"]
  -o, --output           Where to place generated models
                            [default: "./output"]
  -s, --schema           Schema name to create model from. Only for mssql
                         and postgres. You can pass multiple values
                         separated by comma eg. -s scheme1,scheme2,scheme3
  --ssl                                               [boolean] [default: false]

  --noConfig             Doesn't create tsconfig.json and
                         ormconfig.json         [布尔] [默认值: false]

  --cp, --case-property  Convert property names to specified case
                  [可选值: "pascal", "camel", "snake", "none"] [默认值: "camel"]

```
