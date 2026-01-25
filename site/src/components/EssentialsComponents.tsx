import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const Container = styled('div', {
  padding: '120px 0',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--midway-bg)',
  
  '@mobile': {
    padding: '80px 0',
  }
})

const Content = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  position: 'relative',
  zIndex: 2,
  
  '@mobile': {
    padding: '0 16px',
  }
})

const SectionTitle = styled('div', {
  marginBottom: '60px',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out`,
})

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.9rem',
  color: 'var(--midway-secondary)',
  marginBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
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
    margin: '8px auto 0',
    borderRadius: '2px',
  }
})

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
})

const ComponentCard = styled('a', {
  display: 'flex',
  alignItems: 'center',
  padding: '24px',
  background: 'var(--midway-surface)',
  border: '1px solid var(--midway-border)',
  borderRadius: '4px',
  textDecoration: 'none',
  transition: 'all 0.3s',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'var(--midway-primary)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    
    '& .icon': {
      color: 'var(--midway-primary)',
    }
  },
})

const IconWrapper = styled('div', {
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--midway-bg)',
  border: '1px solid var(--midway-border)',
  borderRadius: '4px',
  marginRight: '16px',
  flexShrink: 0,
})

const Icon = styled('i', {
  fontSize: '24px',
  color: 'var(--midway-text-sec)',
  transition: 'color 0.3s',
})

const TextWrapper = styled('div', {
  flex: 1,
})

const CardTitle = styled('h4', {
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 4px 0',
})

const CardDesc = styled('p', {
  fontSize: '0.9rem',
  color: 'var(--midway-text-sec)',
  margin: 0,
  lineHeight: 1.4,
})

const ArrowIcon = styled('i', {
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%) translateX(-10px)',
  fontSize: '16px',
  color: 'var(--midway-primary)',
  opacity: 0,
  transition: 'all 0.3s ease',
})

type ComponentProps = {
  icon: string
  title: string
  link: string
  description: string
}

function Component(props: ComponentProps) {
  return (
    <ComponentCard href={props.link} target="_blank">
      <IconWrapper>
        <Icon className={`iconfont ${props.icon} icon`} />
      </IconWrapper>
      <TextWrapper>
        <CardTitle>{props.title}</CardTitle>
        <CardDesc>{props.description}</CardDesc>
      </TextWrapper>
      <ArrowIcon className="iconfont icon-arrow-right arrow-icon" />
    </ComponentCard>
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
    description: 'In-memory database',
    icon: 'icon-redis',
  },
  {
    title: 'Swagger',
    link: '/docs/extensions/swagger',
    description: 'Generate API docs',
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

export function EssentialsComponents() {
  return (
    <Container>
      <Content>
        <SectionTitle>
          <SectionLabel>04 // Ecosystem</SectionLabel>
          <SectionHeading>
            <Translate id="homepage.essentials.title">
              Core Extensions
            </Translate>
          </SectionHeading>
        </SectionTitle>
        
        <Grid>
          {components.map((component, index) => (
            <div key={index} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.1 + index * 0.1}s both` }}>
              <Component {...component} />
            </div>
          ))}
        </Grid>
      </Content>
    </Container>
  )
}
