import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

type FeatureProps = {
  icon: string
  title: string
  description: React.ReactNode
  isMiddle?: boolean
}

const Container = styled('section', {
  padding: '120px 0',
  width: '100%',
  backgroundColor: 'var(--midway-bg)',
  position: 'relative',
  overflow: 'hidden',
  
  '@mobile': {
    padding: '80px 0',
  }
})

const FeaturesGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  position: 'relative',
  zIndex: 2,
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '24px',
    padding: '0 16px',
  }
})

const FeatureCard = styled('div', {
  background: 'var(--midway-surface)',
  backdropFilter: 'blur(20px)',
  borderRadius: '4px',
  padding: '40px 32px',
  textAlign: 'left',
  border: '1px solid var(--midway-border)',
  transition: 'all 0.3s ease',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  
  // Circuit pattern background
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(var(--midway-grid) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    opacity: 0.3,
    zIndex: 0,
  },

  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'var(--midway-secondary)',
    boxShadow: '0 10px 30px -10px var(--midway-glow)',
    
    '& .status-light': {
      background: 'var(--midway-secondary)',
      boxShadow: '0 0 10px var(--midway-secondary)',
    },
    
    '& .icon-container': {
      borderColor: 'var(--midway-secondary)',
      color: 'var(--midway-secondary)',
      boxShadow: '0 0 15px var(--midway-glow)',
    }
  },
})

const StatusLight = styled('div', {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--midway-border)',
  transition: 'all 0.3s',
})

// HUD Corners
const HudCorner = styled('div', {
  position: 'absolute',
  width: '20px',
  height: '20px',
  border: '2px solid var(--midway-primary)',
  transition: 'all 0.3s',
  opacity: 0.7,
  pointerEvents: 'none',
  zIndex: 1,

  variants: {
    pos: {
      tl: { top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none' },
      br: { bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none' },
    }
  }
})

const IconContainer = styled('div', {
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
  border: '1px solid var(--midway-border)',
  background: 'var(--midway-bg)',
  color: 'var(--midway-primary)',
  borderRadius: '4px',
  position: 'relative',
  zIndex: 1,
  transition: 'all 0.3s',
})

const Icon = styled('i', {
  fontSize: '24px',
})

const Title = styled('h3', {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 16px 0',
  lineHeight: 1.3,
  position: 'relative',
  zIndex: 1,
})

const Description = styled('div', {
  fontSize: '1rem',
  color: 'var(--midway-text-sec)',
  lineHeight: 1.6,
  margin: 0,
  position: 'relative',
  zIndex: 1,
})

const SectionTitle = styled('div', {
  marginBottom: '60px',
  maxWidth: '1200px',
  margin: '0 auto 60px',
  padding: '0 24px',
  animation: `${fadeInUp} 0.8s ease-out`,
  
  '@mobile': {
    marginBottom: '40px',
    padding: '0 16px',
    textAlign: 'center',
  }
})

const SectionHeading = styled('h2', {
  fontSize: '2.5rem',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  margin: '0 0 10px 0',
  display: 'inline-block',
  position: 'relative',
  
  '&::after': {
    content: '""',
    display: 'block',
    width: '40%',
    height: '4px',
    background: 'var(--midway-secondary)',
    marginTop: '8px',
    borderRadius: '2px',
    
    '@mobile': {
      margin: '8px auto 0',
    }
  }
})

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.9rem',
  color: 'var(--midway-secondary)',
  marginBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

function Feature(props: FeatureProps) {
  return (
    <FeatureCard>
      <HudCorner pos="tl" />
      <HudCorner pos="br" />
      <StatusLight className="status-light" />
      
      <IconContainer className="icon-container">
        <Icon className={`iconfont ${props.icon}`} />
      </IconContainer>
      <Title>{props.title}</Title>
      <Description>
        {props.description}
      </Description>
    </FeatureCard>
  )
}

const features = [
  {
    icon: 'icon-huojiancopy',
    title: 'Reliable & Fast',
    description: (
      <>
        <Translate id="homepage.corefeatures.reliable.line1">
          Class + IoC = 更优雅的架构
        </Translate>
        <br />
        <Translate id="homepage.corefeatures.reliable.line2">
          Function + Hooks = 更高的研发效率
        </Translate>
      </>
    ),
  },
  {
    icon: 'icon-nintendogamecube',
    title: 'API & Fullstack',
    description: <Translate id="homepage.corefeatures.api.description">
      不仅支持开发 API 服务，也提供业界首创的一体化全栈开发模式
    </Translate>,
    isMiddle: true
  },
  {
    icon: 'icon-MPIS-Upgrade',
    title: 'Progressive',
    description: <Translate id="homepage.corefeatures.progressive.description">
      渐进式设计，提供从基础到入门再到企业级的升级方案，解决应用维护与拓展性难题
    </Translate>,
  },
] as FeatureProps[]

export function CoreFeatures() {
  return (
    <Container>
      <SectionTitle>
        <SectionLabel>01 // Capabilities</SectionLabel>
        <SectionHeading>
          <Translate id="homepage.corefeatures.title">
            Core Architecture
          </Translate>
        </SectionHeading>
      </SectionTitle>
      
      <FeaturesGrid>
        {features.map((feature, index) => (
          <div key={feature.title} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both` }}>
            <Feature {...feature} />
          </div>
        ))}
      </FeaturesGrid>
    </Container>
  )
}
