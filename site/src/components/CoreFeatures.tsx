import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(40px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const scanLine = keyframes({
  '0%': { left: '-100%' },
  '100%': { left: '110%' },
});

const glowPulse = keyframes({
  '0%, 100%': { opacity: 0.3 },
  '50%': { opacity: 0.8 },
});

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.2 },
});

type FeatureProps = {
  icon: string
  title: string
  description: React.ReactNode
  accentColor?: string
}

const Container = styled('section', {
  padding: '140px 0',
  width: '100%',
  backgroundColor: 'var(--midway-bg)',
  position: 'relative',
  overflow: 'hidden',

  // 底部分隔线
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--midway-border), transparent)',
  },

  '@mobile': {
    padding: '80px 0',
  }
})

// 背景光晕装饰
const BgOrb = styled('div', {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
  filter: 'blur(80px)',

  variants: {
    pos: {
      left: {
        top: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'var(--midway-glow)',
        opacity: 0.15,
      },
      right: {
        bottom: '-20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'var(--midway-glow)',
        opacity: 0.12,
        animationDelay: '3s',
      }
    }
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
    gap: '20px',
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
  transition: 'all 0.4s ease',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  cursor: 'default',

  // 点阵背景
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(var(--midway-grid) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    opacity: 0.4,
    zIndex: 0,
    transition: 'opacity 0.4s',
  },

  // 扫光层
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
    zIndex: 1,
    transition: 'none',
  },

  '&:hover': {
    transform: 'translateY(-6px)',
    borderColor: 'var(--midway-secondary)',
    boxShadow: '0 20px 50px -10px var(--midway-glow), 0 0 0 1px var(--midway-secondary)',

    '&::before': { opacity: 0.7 },
    '&::after': {
      animation: `${scanLine} 0.7s ease-out forwards`,
    },

    '& .status-light': {
      background: 'var(--midway-secondary)',
      boxShadow: '0 0 12px var(--midway-secondary)',
    },

    '& .icon-container': {
      borderColor: 'var(--midway-secondary)',
      color: 'var(--midway-secondary)',
      boxShadow: '0 0 20px var(--midway-glow)',
      background: 'rgba(0,0,0,0.1)',
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
  animation: `${blink} 3s infinite`,
  zIndex: 2,
})

// HUD Corners - 四个角的装饰线
const HudCorner = styled('div', {
  position: 'absolute',
  width: '20px',
  height: '20px',
  border: '2px solid var(--midway-primary)',
  transition: 'all 0.4s ease',
  opacity: 0.6,
  pointerEvents: 'none',
  zIndex: 2,

  variants: {
    pos: {
      tl: { top: '-1px', left: '-1px', borderRight: 'none', borderBottom: 'none' },
      tr: { top: '-1px', right: '-1px', borderLeft: 'none', borderBottom: 'none' },
      bl: { bottom: '-1px', left: '-1px', borderRight: 'none', borderTop: 'none' },
      br: { bottom: '-1px', right: '-1px', borderLeft: 'none', borderTop: 'none' },
    }
  }
})

const IconContainer = styled('div', {
  width: '52px',
  height: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '28px',
  border: '1px solid var(--midway-border)',
  background: 'var(--midway-bg)',
  color: 'var(--midway-primary)',
  borderRadius: '6px',
  position: 'relative',
  zIndex: 1,
  transition: 'all 0.4s ease',
})

const Icon = styled('i', {
  fontSize: '26px',
})

const CardIndex = styled('div', {
  position: 'absolute',
  top: '18px',
  left: '20px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.7rem',
  color: 'var(--midway-text-sec)',
  opacity: 0.6,
  letterSpacing: '0.1em',
  zIndex: 2,
})

const Title = styled('h3', {
  fontSize: '1.4rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 14px 0',
  lineHeight: 1.3,
  position: 'relative',
  zIndex: 1,
})

const Description = styled('div', {
  fontSize: '0.95rem',
  color: 'var(--midway-text-sec)',
  lineHeight: 1.65,
  margin: 0,
  position: 'relative',
  zIndex: 1,
})

// 底部进度指示条
const CardFooter = styled('div', {
  marginTop: 'auto',
  paddingTop: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  position: 'relative',
  zIndex: 1,
})

const ProgressBar = styled('div', {
  flex: 1,
  height: '2px',
  background: 'var(--midway-border)',
  borderRadius: '1px',
  overflow: 'hidden',

  '&::after': {
    content: '""',
    display: 'block',
    height: '100%',
    background: 'linear-gradient(90deg, var(--midway-primary), var(--midway-secondary))',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s linear infinite`,
  }
})

const ProgressLabel = styled('span', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.7rem',
  color: 'var(--midway-secondary)',
  flexShrink: 0,
})

const SectionTitle = styled('div', {
  marginBottom: '60px',
  maxWidth: '1200px',
  margin: '0 auto 70px',
  padding: '0 24px',

  '@mobile': {
    marginBottom: '40px',
    padding: '0 16px',
    textAlign: 'center',
  }
})

const SectionHeading = styled('h2', {
  fontSize: '2.8rem',
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
    background: 'linear-gradient(90deg, var(--midway-secondary), transparent)',
    marginTop: '10px',
    borderRadius: '2px',

    '@mobile': {
      margin: '10px auto 0',
    }
  }
})

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.85rem',
  color: 'var(--midway-secondary)',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '20px',
    height: '1px',
    background: 'var(--midway-secondary)',
  }
})

const features = [
  {
    icon: 'icon-huojiancopy',
    index: '01',
    title: 'Reliable & Fast',
    progress: '98%',
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
    index: '02',
    title: 'API & Fullstack',
    progress: '96%',
    description: <Translate id="homepage.corefeatures.api.description">
      不仅支持开发 API 服务，也提供业界首创的一体化全栈开发模式
    </Translate>,
  },
  {
    icon: 'icon-MPIS-Upgrade',
    index: '03',
    title: 'Progressive',
    progress: '100%',
    description: <Translate id="homepage.corefeatures.progressive.description">
      渐进式设计，提供从基础到入门再到企业级的升级方案，解决应用维护与拓展性难题
    </Translate>,
  },
] as (FeatureProps & { index: string; progress: string })[]

function Feature(props: FeatureProps & { index: string; progress: string }) {
  return (
    <FeatureCard>
      <HudCorner pos="tl" />
      <HudCorner pos="tr" />
      <HudCorner pos="bl" />
      <HudCorner pos="br" />
      <StatusLight className="status-light" />
      <CardIndex>{props.index}</CardIndex>

      <IconContainer className="icon-container" style={{ marginTop: '32px' }}>
        <Icon className={`iconfont ${props.icon}`} />
      </IconContainer>
      <Title>{props.title}</Title>
      <Description>
        {props.description}
      </Description>
      <CardFooter>
        <ProgressBar style={{ '--progress': props.progress } as any} />
        <ProgressLabel>{props.progress}</ProgressLabel>
      </CardFooter>
    </FeatureCard>
  )
}

export function CoreFeatures() {
  return (
    <Container>
      <BgOrb pos="left" />
      <BgOrb pos="right" />

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
          <div key={feature.title} style={{ animation: `${fadeInUp} 0.7s ease-out ${0.1 + index * 0.15}s both` }}>
            <Feature {...feature} />
          </div>
        ))}
      </FeaturesGrid>
    </Container>
  )
}
