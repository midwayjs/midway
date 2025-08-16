import { Block } from './Block'
import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const pulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
});

const ComponentContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '24px',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    background: 'rgba(255, 255, 255, 0.95)',
    
    '& .icon-container': {
      transform: 'scale(1.1)',
      animation: `${pulse} 2s ease-in-out infinite`,
    },
    
    '& .title': {
      color: '#667eea',
    },
  },
})

const IconContainer = styled('div', {
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  flexShrink: 0,
})

const Icon = styled('i', {
  fontSize: '28px',
  color: '#ffffff',
  transition: 'all 0.3s ease',
})

const TextContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '20px',
  flex: 1,
})

const Title = styled('a', {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#2d3748',
  textDecoration: 'none',
  marginBottom: '8px',
  transition: 'all 0.3s ease',
  display: 'block',
  
  '&:hover': {
    color: '#667eea',
    textDecoration: 'none',
  },
})

const Description = styled('span', {
  fontSize: '1rem',
  color: '#718096',
  lineHeight: 1.5,
  margin: 0,
})

type ComponentProps = {
  icon: string
  title: string
  link: string
  description: string
}

function Component(props: ComponentProps) {
  return (
    <ComponentContainer onClick={() => window.open(props.link, '_blank')}>
      <IconContainer className="icon-container">
        <Icon className={`${props.icon} iconfont`} />
      </IconContainer>
      <TextContainer>
        <Title href={props.link} className="title">{props.title}</Title>
        <Description>{props.description}</Description>
      </TextContainer>
    </ComponentContainer>
  )
}

const components = [
  {
    title: 'ORM',
    link: '/docs/extensions/orm',
    description: 'TypeORM-based database SDK',
    icon: 'icon-database_plus_fill',
  },
  {
    title: 'Redis',
    link: '/docs/extensions/redis',
    description: 'In-memory database for midway.js',
    icon: 'icon-redis',
  },
  {
    title: 'Swagger',
    link: '/docs/extensions/swagger',
    description: 'Generate API documentation',
    icon: 'icon-swagger',
  },
  {
    title: 'Mongodb',
    link: '/docs/extensions/mongodb',
    description: 'NoSQL Database',
    icon: 'icon-MongoDB',
  },
  {
    title: 'Cache',
    link: '/docs/extensions/cache',
    description: 'Memory cache support',
    icon: 'icon-memcacheyunshujukuMemcac',
  },
  {
    title: 'OSS',
    link: '/docs/extensions/oss',
    description: 'Aliyun OSS Support',
    icon: 'icon-ossduixiangcunchuOSS',
  },
] as ComponentProps[]

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '16px',
    padding: '0 16px',
  },
})

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  background: 'var(--ifm-color-background)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 70%, var(--ifm-color-emphasis-200) 0%, transparent 50%), radial-gradient(circle at 70% 30%, var(--ifm-color-emphasis-300) 0%, transparent 50%)',
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
  color: 'var(--ifm-color-emphasis-900)',
  textAlign: 'center',
  margin: '0 0 24px 0',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
})

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: '#718096',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
  }
})

export function EssentialsComponents() {
  return (
    <EnhancedBlock>
      <BlockContent>
        <BlockTitle>核心组件</BlockTitle>
        <BlockSubtitle>
          提供丰富的企业级组件，满足各种开发需求，让开发更加高效
        </BlockSubtitle>
        
        <Grid>
          {components.map((component, index) => (
            <div key={index} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.1 + index * 0.1}s both` }}>
              <Component {...component} />
            </div>
          ))}
        </Grid>
      </BlockContent>
    </EnhancedBlock>
  )
}
