import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const float = keyframes({
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
});

const Container = styled('section', {
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
    background: 'radial-gradient(circle at 20% 80%, var(--ifm-color-emphasis-200) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--ifm-color-emphasis-300) 0%, transparent 50%)',
  },
  
  '@mobile': {
    padding: '80px 0',
  }
})

const Content = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
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
  color: '#ffffff',
  margin: '0 0 24px 0',
  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
})

const SectionSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'rgba(255, 255, 255, 0.9)',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
  }
})

const AdvantagesGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '32px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '24px',
  }
})

const AdvantageCard = styled('div', {
  background: 'var(--ifm-color-emphasis-100)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '32px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  transition: 'all 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  
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
    background: 'var(--ifm-color-emphasis-200)',
    borderColor: 'var(--ifm-color-emphasis-300)',
    
    '&::before': {
      transform: 'scaleX(1)',
    },
    
    '& .icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
})

const IconContainer = styled('div', {
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
  transition: 'all 0.4s ease',
})

const Icon = styled('i', {
  fontSize: '28px',
  color: 'var(--ifm-color-primary-contrast-foreground)',
  transition: 'all 0.4s ease',
})

const CardTitle = styled('h3', {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 16px 0',
  lineHeight: 1.3,
})

const CardDescription = styled('p', {
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: 1.6,
  margin: 0,
})

const FloatingElements = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1,
})

const FloatingElement = styled('div', {
  position: 'absolute',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.05)',
  animation: `${float} 8s ease-in-out infinite`,
  
  '&:nth-child(1)': {
    top: '15%',
    left: '10%',
    animationDelay: '0s',
    animationDuration: '12s',
  },
  '&:nth-child(2)': {
    top: '65%',
    right: '15%',
    animationDelay: '4s',
    animationDuration: '15s',
  },
  '&:nth-child(3)': {
    bottom: '20%',
    left: '25%',
    animationDelay: '8s',
    animationDuration: '18s',
  },
})

const advantages = [
  {
    icon: 'icon-huojiancopy',
    title: '高性能',
    description: '基于 Node.js 原生性能，支持 TypeScript，编译时优化，运行时高效',
  },
  {
    icon: 'icon-nintendogamecube',
    title: '企业级',
    description: '提供完整的依赖注入、中间件、插件系统，满足大型应用开发需求',
  },
  {
    icon: 'icon-MPIS-Upgrade',
    title: '全栈开发',
    description: '支持前后端一体化开发，减少沟通成本，提高开发效率',
  },
  {
    icon: 'icon-database_plus_fill',
    title: '生态丰富',
    description: '内置多种数据库支持，丰富的扩展组件，快速构建完整应用',
  },
  {
    icon: 'icon-redis',
    title: '云原生',
    description: '支持 Serverless、容器化部署，轻松应对云环境挑战',
  },
  {
    icon: 'icon-swagger',
    title: '开发体验',
    description: '优秀的 TypeScript 支持，智能提示，调试友好，提升开发幸福感',
  },
]

export function MidwayAdvantages() {
  return (
    <Container>
      <FloatingElements>
        <FloatingElement />
        <FloatingElement />
        <FloatingElement />
      </FloatingElements>
      
      <Content>
        <SectionTitle>
          <SectionHeading>为什么选择 Midway</SectionHeading>
          <SectionSubtitle>
            专为现代 Node.js 应用设计，提供企业级的开发体验和性能表现
          </SectionSubtitle>
        </SectionTitle>
        
        <AdvantagesGrid>
          {advantages.map((advantage, index) => (
            <div key={advantage.title} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both` }}>
              <AdvantageCard>
                <IconContainer className="icon">
                  <Icon className={`iconfont ${advantage.icon}`} />
                </IconContainer>
                <CardTitle>{advantage.title}</CardTitle>
                <CardDescription>{advantage.description}</CardDescription>
              </AdvantageCard>
            </div>
          ))}
        </AdvantagesGrid>
      </Content>
    </Container>
  )
}
