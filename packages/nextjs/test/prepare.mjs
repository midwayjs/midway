#!/usr/bin/env zx

// 排除 .next 目录，只查找实际的项目目录
const fixtures = await $`find test/fixtures -type f -name package.json -not -path "*/\.*/*"`.text()

for (const fixture of fixtures.split('\n').filter(Boolean)) {
  // 获取 package.json 所在目录
  const dir = path.dirname(fixture)
  cd(dir)
  await $`pnpm run build`.verbose()
}
