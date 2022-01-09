import { Block } from './Block'
import React from 'react'
import { VAR } from '../var'
import { styled } from '../styled'

const Container = styled('div', {})

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  columnGap: 32,
  rowGap: 32,
  '@mobile': {
    gridTemplateColumns: '1fr',
  }
})

const ShowCaseContainer = styled('a', {
  boxShadow: `1px 1px 5px #ccc`,
  borderRadius: 4,
  display: 'inline-block',
  height: 125,
  cursor: 'pointer',
  ':root[data-theme="dark"] &': {
    boxShadow: 'none',
  }
})

const ShowCase = styled('img', {
  height: 125,
})

type Case = {
  image: string
  link: string
}

const cases = [
  { image: '//gw.alicdn.com/imgextra/i4/19999999999999/O1CN01PEPPo02NjasvUe8cc_!!19999999999999-2-tps.png' }, // react
  { image: '//gw.alicdn.com/tfs/TB1Cdu2UYr1gK0jSZFDXXb9yVXa-1200-669.png' }, // vue
  { image: '//gw.alicdn.com/tfs/TB18DKdjCR26e4jSZFEXXbwuXXa-1200-669.png' }, // rax
  { image: '//gw.alicdn.com/tfs/TB11mzgg0Tfau8jSZFwXXX1mVXa-1200-669.png' }, // tablestore
  { image: '//gw.alicdn.com/imgextra/i3/19999999999999/O1CN01HLo3Pi2NjasqFIZbi_!!19999999999999-2-tps.png' }, // koa
  { image: '//gw.alicdn.com/imgextra/i2/19999999999999/O1CN01LggSYp2NjassPrZeZ_!!19999999999999-2-tps.png' }, // ice
  { image: '//gw.alicdn.com/tfs/TB1l2LaU1L2gK0jSZFmXXc7iXXa-1200-669.png' }, // hexo
  { image: '//gw.alicdn.com/tfs/TB12AhMjcVl614jSZKPXXaGjpXa-1200-669.png' }, // express
  { image: '//gw.alicdn.com/tfs/TB1NtHPh5pE_u4jSZKbXXbCUVXa-1200-669.png' }, // egg
  { image: '//gw.alicdn.com/tfs/TB1bonEgsieb18jSZFvXXaI3FXa-1200-669.png' }, // dingtalk
  { image: '//gw.alicdn.com/tfs/TB1Fh51U.Y1gK0jSZFMXXaWcVXa-1200-669.png' }, // antd
  { image: '//gw.alicdn.com/tfs/TB1Ro.miMgP7K4jSZFqXXamhVXa-1200-669.png' }, // typeorm
  { image: '//gw.alicdn.com/imgextra/i1/19999999999999/O1CN01FDOJdG2NjasvEbjxX_!!19999999999999-2-tps.png' }, // sequelize
  { image: '//gw.alicdn.com/tfs/TB1MM_aU8r0gK0jSZFnXXbRRXXa-1200-669.png' }, // img
  { image: '//gw.alicdn.com/tfs/TB1Fuy3UYr1gK0jSZFDXXb9yVXa-1200-669.png' }, // ssr
] as Case[]

export function Example() {
  return (
    <Block title="Examples" subtitle="Learn the usage of Midway.js" background="dark">
      <Container>
        <Grid>
          {cases.map((cas) => {
            return (
              <ShowCaseContainer key={cas.image} href={cas.link || 'http://demo.midwayjs.org/'} target="_blank">
                <ShowCase src={cas.image} />
              </ShowCaseContainer>
            )
          })}
        </Grid>
      </Container>
    </Block>
  )
}
