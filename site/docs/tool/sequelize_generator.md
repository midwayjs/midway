# sequelize-auto-midway

forked from [sequelize/sequelize-auto](https://github.com/sequelize/sequelize-auto)

通过已存在的数据库生成用于 `Midway` 的 `Sequelize` 实体。

其他详细文档和用法请参考 [sequelize/sequelize-auto](https://github.com/sequelize/sequelize-auto)

## Installation

```bash
$ npm i sequelize-auto-midway
```

## Usage

```bash
# 推荐
# 请替换配置信息
npx sequelize-auto-midway -h localhost -d yourDBname -u root -x yourPassword -p 13306  --dialect mysql -o ./models --noInitModels true --caseModel c --caseProp c --caseFile c --indentation 1 -a ./additional.json
```

additional.json

```json
{
  "timestamps": true,
  "paranoid": true
}
```

自动生成的模板文件如下：

```ts
import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'task',
  timestamps: false,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'task_id' }],
    },
  ],
})
export class TaskEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'task_id',
  })
  taskId: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '任务所属应用ID: 0-无所属',
    field: 'app_id',
  })
  appId: number;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    comment: '任务名称',
    field: 'task_name',
  })
  taskName: string;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '任务类别:1-cron,2-interval',
  })
  type: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '任务状态:0-暂停中,1-启动中',
  })
  status: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '任务开始时间',
    field: 'start_time',
  })
  startTime: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '任务结束时间',
    field: 'end_time',
  })
  endTime: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: -1,
    comment: '任务执行次数',
  })
  limit: number;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
    defaultValue: '',
    comment: '任务cron配置',
  })
  cron: string;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: '任务执行间隔时间',
  })
  every: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '参数',
  })
  args: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '备注',
  })
  remark: string;
}
```

Use `npx sequelize-auto-midway --help` to see all available parameters with their descriptions. Some basic parameters below:

```bash
Usage: npx sequelize-auto-midway -h <host> -d <database> -p [port] -u <user> -x
[password] -e [engine]

Options:
    --help               Show help                                   [boolean]
    --version            Show version number                         [boolean]
-h, --host               IP/Hostname for the database.                [string]
-d, --database           Database name.                               [string]
-u, --user               Username for database.                       [string]
-x, --pass               Password for database. If specified without providing
                          a password, it will be requested interactively from
                          the terminal.
-p, --port               Port number for database (not for sqlite). Ex:
                          MySQL/MariaDB: 3306, Postgres: 5432, MSSQL: 1433
                                                                      [number]
-c, --config             Path to JSON file for Sequelize-Auto options and
                          Sequelize's constructor "options" flag object as
                          defined here:
                          https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
                                                                      [string]
-o, --output             What directory to place the models.          [string]
-e, --dialect            The dialect/engine that you're using: postgres,
                          mysql, sqlite, mssql                         [string]
-a, --additional         Path to JSON file containing model options (for all
                          tables). See the options: https://sequelize.org/master/class/lib/model.js~Model.html#static-method-init
                                                                      [string]
    --indentation        Number of spaces to indent                   [number]
-t, --tables             Space-separated names of tables to import     [array]
-T, --skipTables         Space-separated names of tables to skip       [array]
--caseModel, --cm        Set case of model names: c|l|o|p|u
                          c = camelCase
                          l = lower_case
                          o = original (default)
                          p = PascalCase
                          u = UPPER_CASE
--caseProp, --cp         Set case of property names: c|l|o|p|u
--caseFile, --cf         Set case of file names: c|l|o|p|u|k
                          k = kebab-case
--noAlias                Avoid creating alias `as` property in relations
                                                                     [boolean]
--noInitModels           Prevent writing the init-models file        [boolean]
-n, --noWrite            Prevent writing the models to disk          [boolean]
-s, --schema             Database schema from which to retrieve tables[string]
-v, --views              Include database views in generated models  [boolean]
-l, --lang               Language for Model output: es5|es6|esm|ts
                          es5 = ES5 CJS modules (default)
                          es6 = ES6 CJS modules
                          esm = ES6 ESM modules
                          ts = TypeScript                             [string]
--useDefine              Use `sequelize.define` instead of `init` for es6|esm|ts
--singularize, --sg      Singularize model and file names from plural table
                          names
```
