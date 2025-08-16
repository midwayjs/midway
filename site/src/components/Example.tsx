import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'

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

const ShowCaseContainer = styled('a', {
  display: 'block',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    
    '& .showcase': {
      transform: 'scale(1.1)',
    },
  },
})

const ShowCase = styled('img', {
  width: '100%',
  height: 'auto',
  transition: 'transform 0.3s ease',
  display: 'block',
})

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.2) 0%, transparent 50%)',
  },
  
  '@mobile': {
    padding: '80px 0',
  }
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

const BlockTitle = styled('h2', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: '#ffffff',
  textAlign: 'center',
  margin: '0 0 24px 0',
})

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
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
        <BlockTitle>应用案例</BlockTitle>
        <BlockSubtitle>
          探索 Midway.js 在各种场景下的应用，了解其强大的适应性和灵活性
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
