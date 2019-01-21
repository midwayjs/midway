# tslint-midway-contrib

[![Package Quality](http://npm.packagequality.com/shield/tslint-midway-contrib.svg)](http://packagequality.com/#?package=tslint-midway-contrib)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.

Document: [https://midwayjs.org/midway](https://midwayjs.org/midway)

## Install

```bash
tnpm i tslint tslint-midway-contrib --save-dev
```

## Usage

- `package.json`

```json
  "prettier": {
    "singleQuote": true
  }
```

### Configuration

- `tslint.json`

```json
{
  "extends": ["tslint-midway-contrib"]
}
```


### Which Rules Should I Turn On?

There certainly are a lot of options!
To start, you can enable our recommended defaults ([recommended ruleset](http://gitlab.alibaba-inc.com/TBTakeout/midway-tslint-contrib/blob/master/tslint.comment.json)) by adding `"@ali/tslint-midway"` under `"extends"` in your `tslint.json`:

```json
{
    "extends": ["tslint-midway-contrib"],
    "rulesDirectory": ["node_modules/tslint-midway-contrib"],
    "rules": {
        // ...
    }
}
```

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
