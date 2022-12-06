# typeorm:Model Generator

Thank community user @youtiao66 for providing this module.


With this tool, you can quickly create a TypeORM Model for Midway.


## Use

For example, generate a mysql model.

```bash
# Recommended
# Please replace the configuration information
$npx mdl-gen-midway -h localhost -p 3306 -d yourdbname -u root -x yourpassword -e mysql --noConfig --case-property none
```

Full parameters:

```
Usage: npx mdl-gen-midway -h <host> -d <database> -p [port] -u <user> -x
[password] -e [engine]

Options:
  --help Show help [boolean]
  --version Show version number [boolean]
  -h, --host IP address/Hostname for database server
                                                          [default: "127.0.0.1"]
  -d, --database Database name(or path for sqlite) [required]
  -u, --user Username for database server
  -x, --pass Password for database server [default: ""]
  -p, --port Port number for database server
  -e, --engine Database engine
          [choices: "mssql", "postgres", "mysql", "mariadb", "oracle", "sqlite"]
                                                              [default: "mssql"]
  -o, --output Where to place generated models
                            [default: "./output"]
  -s, --schema Schema name to create model from. Only for mssql
                         and postgres. You can pass multiple values
                         separated by comma eg. -s scheme1,scheme2,scheme3
  --ssl [boolean] [default: false]

  --noConfig Doesn't create tsconfig.json and
                         ormconfig.json [Boolean] [Default: false]

  --cp, --case-property Convert property names to specified case
                  [Optional values: "pascal", "camel", "snake", "none"] [Default value: "camel"]

```
