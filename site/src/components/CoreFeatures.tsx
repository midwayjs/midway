import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const float = keyframes({
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
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
  background: 'var(--ifm-color-emphasis-100)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, var(--ifm-color-emphasis-200) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--ifm-color-emphasis-300) 0%, transparent 50%)',
    opacity: 0.3,
  },
  
  '@mobile': {
    padding: '80px 0',
  }
})

const FeaturesGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '40px',
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
  background: 'var(--ifm-color-background)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '48px 32px',
  textAlign: 'center',
  boxShadow: '0 8px 32px var(--ifm-color-emphasis-200)',
  border: '1px solid var(--ifm-color-emphasis-200)',
  transition: 'all 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  height: '320px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, var(--ifm-color-primary), var(--ifm-color-primary-darker))',
    transform: 'scaleX(0)',
    transition: 'transform 0.4s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px var(--ifm-color-emphasis-300)',
    borderColor: 'var(--ifm-color-emphasis-300)',
    
    '&::before': {
      transform: 'scaleX(1)',
    },
    
    '& .icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
  
  variants: {
    isMiddle: {
      true: {
        background: 'var(--ifm-color-emphasis-50)',
        transform: 'scale(1.05)',
        
        '&:hover': {
          transform: 'scale(1.05) translateY(-8px)',
        },
      }
    }
  },
  
  '@mobile': {
    padding: '32px 24px',
    height: 'auto',
    minHeight: '280px',
    
    variants: {
      isMiddle: {
        true: {
          transform: 'scale(1)',
          
          '&:hover': {
            transform: 'translateY(-8px)',
          },
        }
      }
    }
  }
})

const IconContainer = styled('div', {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 32px',
  transition: 'all 0.4s ease',
  flexShrink: 0,
  
  '@mobile': {
    width: '64px',
    height: '64px',
    marginBottom: '24px',
  }
})

const Icon = styled('i', {
  fontSize: '36px',
  color: '#ffffff',
  transition: 'all 0.4s ease',
  
  '@mobile': {
    fontSize: '28px',
  }
})

const Title = styled('h3', {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 20px 0',
  lineHeight: 1.3,
  flexShrink: 0,
  
  '@mobile': {
    fontSize: '1.5rem',
    marginBottom: '16px',
  }
})

const Description = styled('p', {
  fontSize: '1.1rem',
  color: 'var(--ifm-color-emphasis-700)',
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '280px',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '@mobile': {
    fontSize: '1rem',
    maxWidth: '100%',
  }
})

const SectionTitle = styled('div', {
  textAlign: 'center',
  marginBottom: '80px',
  animation: `${fadeInUp} 0.8s ease-out`,
  
  '@mobile': {
    marginBottom: '60px',
  }
})

const SectionHeading = styled('h2', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 24px 0',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
})

const SectionSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--ifm-color-emphasis-600)',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
  }
})

function Feature(props: FeatureProps) {
  return (
    <FeatureCard isMiddle={props.isMiddle}>
      <IconContainer className="icon">
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
        <SectionHeading>
          <Translate id="homepage.corefeatures.title">
            核心特性
          </Translate>
        </SectionHeading>
        <SectionSubtitle>
          <Translate id="homepage.corefeatures.subtitle">
            专为现代 Node.js 应用设计，提供企业级的开发体验和性能表现
          </Translate>
        </SectionSubtitle>
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
