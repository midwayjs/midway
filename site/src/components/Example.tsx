import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const scaleIn = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.8)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
})

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '24px',
  maxWidth: '1000px',
  margin: '0 auto',
  
  '@mobile': {
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  }
})

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  background: 'var(--midway-bg)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `
      linear-gradient(var(--midway-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--midway-grid) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.3,
  },
  
  '@mobile': {
    padding: '80px 0',
  }
})

const BlockTitle = styled('h2', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  textAlign: 'center',
  margin: '0 0 24px 0',
  textShadow: '0 0 20px var(--midway-glow)',
})

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--midway-text-sec)',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
  }
})

const ShowCaseContainer = styled('a', {
  display: 'block',
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: 'var(--midway-surface)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--midway-border)',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    boxShadow: 'inset 0 0 20px var(--midway-glow)',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'var(--midway-primary)',
    
    '&::after': {
      opacity: 0.3,
    },
    
    '& .showcase': {
      transform: 'scale(1.05)',
    },
  },
})

const ShowCase = styled('img', {
  width: '100%',
  height: 'auto',
  transition: 'transform 0.3s ease',
  display: 'block',
})

const BlockContent = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
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
    <EnhancedBlock>
      <BlockContent>
        <BlockTitle>
          <Translate id="homepage.example.title">
            应用案例
          </Translate>
        </BlockTitle>
        <BlockSubtitle>
          <Translate id="homepage.example.subtitle">
            探索 Midway.js 在各种场景下的应用，了解其强大的适应性和灵活性
          </Translate>
        </BlockSubtitle>
        
        <Container>
          <Grid>
            {cases.map((cas, index) => (
              <div key={cas.image} style={{ animation: `${scaleIn} 0.6s ease-out ${0.1 + index * 0.05}s both` }}>
                <ShowCaseContainer href={cas.link || 'http://demo.midwayjs.org/'} target="_blank">
                  <ShowCase src={cas.image} className="showcase" />
                </ShowCaseContainer>
              </div>
            ))}
          </Grid>
        </Container>
      </BlockContent>
    </EnhancedBlock>
  )
}
