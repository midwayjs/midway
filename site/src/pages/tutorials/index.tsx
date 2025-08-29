import React from 'react';
import Layout from '@theme/Layout';
import { styled } from '../../styled';
import { keyframes } from '@stitches/react';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 24px',
  
  '@mobile': {
    padding: '24px 16px',
  }
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '80px',
  animation: `${fadeInUp} 0.8s ease-out`,
  
  '@mobile': {
    marginBottom: '60px',
  }
});

const Title = styled('h1', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 24px 0',
  lineHeight: 1.2,
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const Subtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--ifm-color-emphasis-600)',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
  }
});

const TutorialsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '40px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '24px',
  }
});

const TutorialCard = styled('div', {
  background: 'var(--ifm-color-background)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '40px 32px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  boxShadow: '0 8px 32px var(--ifm-color-emphasis-200)',
  transition: 'all 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  
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
  
  '@mobile': {
    padding: '32px 24px',
  }
});

const IconContainer = styled('div', {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px',
  transition: 'all 0.4s ease',
  
  '@mobile': {
    width: '64px',
    height: '64px',
    marginBottom: '24px',
  }
});

const Icon = styled('i', {
  fontSize: '36px',
  color: '#ffffff',
  transition: 'all 0.4s ease',
  
  '@mobile': {
    fontSize: '28px',
  }
});

const CardTitle = styled('h3', {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 20px 0',
  lineHeight: 1.3,
  
  '@mobile': {
    fontSize: '1.5rem',
    marginBottom: '16px',
  }
});

const CardDescription = styled('p', {
  fontSize: '1.1rem',
  color: 'var(--ifm-color-emphasis-700)',
  lineHeight: 1.6,
  margin: '0 0 24px 0',
  
  '@mobile': {
    fontSize: '1rem',
    marginBottom: '20px',
  }
});

const CardFeatures = styled('ul', {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 32px 0',
  
  '@mobile': {
    marginBottom: '24px',
  }
});

const FeatureItem = styled('li', {
  fontSize: '0.95rem',
  color: 'var(--ifm-color-emphasis-600)',
  lineHeight: 1.5,
  marginBottom: '8px',
  paddingLeft: '20px',
  position: 'relative',
  
  '&::before': {
    content: '✓',
    position: 'absolute',
    left: 0,
    color: 'var(--ifm-color-primary)',
    fontWeight: 'bold',
  }
});

const StartButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 600,
  textDecoration: 'none',
  backgroundColor: 'var(--ifm-color-primary)',
  color: 'var(--ifm-color-primary-contrast-foreground)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    backgroundColor: 'var(--ifm-color-primary-darker)',
    transform: 'translateY(-2px)',
    textDecoration: 'none',
    color: 'var(--ifm-color-primary-contrast-foreground)',
  },
  
  '@mobile': {
    padding: '10px 20px',
    fontSize: '0.9rem',
  }
});

const DisabledButton = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 600,
  backgroundColor: 'var(--ifm-color-emphasis-300)',
  color: 'var(--ifm-color-emphasis-600)',
  opacity: 0.6,
  cursor: 'not-allowed',
  
  '@mobile': {
    padding: '10px 20px',
    fontSize: '0.9rem',
  }
});

const tutorials = [
  {
    icon: 'icon-nintendogamecube',
    title: 'Class 语法教程',
    description: '使用 IoC + 装饰器构建优雅的 Node.js 应用架构',
    features: [
      '基于装饰器的路由定义',
      '依赖注入与服务管理',
      'TypeORM 数据库集成',
      '组件化开发模式'
    ],
    href: '/tutorials/class-syntax',
    difficulty: '中级',
    duration: '2-3 小时',
    disabled: true
  },
  {
    icon: 'icon-huojiancopy',
    title: 'Function 语法教程',
    description: '使用函数 + Hooks 进行快速全栈应用开发',
    features: [
      '前后端一体化开发',
      '函数式 API 设计',
      'React Hooks 后端开发',
      '零 API 调用模式'
    ],
    href: '/tutorials/function-syntax',
    difficulty: '初级',
    duration: '1-2 小时',
    disabled: true
  }
];

export default function TutorialsIndex() {
  return (
    <Layout title="教程中心 - Midway.js" description="通过交互式教程学习 Midway.js 开发">
      <Container>
        <Header>
          <Title>🚧 教程中心 (开发中)</Title>
          <Subtitle>
            WebContainer 功能正在开发中，即将通过浏览器中的真实开发环境提供交互式学习体验
          </Subtitle>
        </Header>
        
        <TutorialsGrid>
          {tutorials.map((tutorial, index) => (
            <div key={tutorial.title} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both` }}>
              <TutorialCard>
                <IconContainer className="icon">
                  <Icon className={`iconfont ${tutorial.icon}`} />
                </IconContainer>
                <CardTitle>{tutorial.title}</CardTitle>
                <CardDescription>{tutorial.description}</CardDescription>
                <CardFeatures>
                  {tutorial.features.map((feature, featureIndex) => (
                    <FeatureItem key={featureIndex}>{feature}</FeatureItem>
                  ))}
                </CardFeatures>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-500)' }}>
                    <span style={{ marginRight: '16px' }}>难度: {tutorial.difficulty}</span>
                    <span>时长: {tutorial.duration}</span>
                  </div>
                  {tutorial.disabled ? (
                    <DisabledButton>
                      🚧 即将开放
                    </DisabledButton>
                  ) : (
                    <StartButton href={tutorial.href}>
                      开始学习 →
                    </StartButton>
                  )}
                </div>
              </TutorialCard>
            </div>
          ))}
        </TutorialsGrid>
      </Container>
    </Layout>
  );
}
