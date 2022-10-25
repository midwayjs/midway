# Check tool

Midway provides some checking tools for common errors to facilitate users to quickly debug them. The `@midwayjs/luckyeye` package provides some basic inspection rules, which can quickly troubleshoot problems with the new version of Midway.

> luckyeye, meaning lucky eyes, can quickly find and locate problems.

## Use

Install the `@midwayjs/luckyeye` package first.

```bash
npm I @midwayjs/luckyeye --save-dev
```

In general, we will add it to a check script, such:

```json
"scripts": {
  // ......
  "check": "luckyeye"
},
```

Next, we need to configure a "rule package". For example, `midway_ v2` is a rule check package for midway v2.

Add the following paragraph to `package.json`.

```json
"midway-luckyeye": {
  "packages": [
    "midway_v2"
  ]
},
```

## Execution

After the configuration is completed, you can execute the inspection script added above.

```bash
npm run check
```

**Blue** indicates the output information. **Green** indicates that the check item passes. **Red** indicates that the check item has a problem and needs to be modified. **Yellow** indicates that the check item can be modified, but optional.

The execution effect is as follows.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1610983986151-79c54e7c-3ff0-4f94-98bc-359dda0fa694.png)

## Custom rule package

Please refer to README for [https:// github.com/midwayjs/luckyeye](https://github.com/midwayjs/luckyeye).
