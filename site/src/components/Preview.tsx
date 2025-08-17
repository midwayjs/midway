import React from 'react';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideInLeft = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-30px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideInRight = keyframes({
  '0%': { opacity: 0, transform: 'translateX(30px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '60px',
  alignItems: 'start',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '40px',
    padding: '0 16px',
  }
});

const TutorialCard = styled('div', {
  background: 'var(--ifm-color-background)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '48px 32px',
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
  backgroundColor: 'var(--ifm-color-emphasis-300)',
  color: 'var(--ifm-color-emphasis-600)',
  transition: 'all 0.3s ease',
  cursor: 'not-allowed',
  opacity: 0.6,
  
  '&:hover': {
    backgroundColor: 'var(--ifm-color-emphasis-300)',
    transform: 'none',
    textDecoration: 'none',
    color: 'var(--ifm-color-emphasis-600)',
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

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--ifm-color-emphasis-50)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 70%, var(--ifm-color-emphasis-200) 0%, transparent 50%), radial-gradient(circle at 70% 30%, var(--ifm-color-emphasis-300) 0%, transparent 50%)',
    opacity: 0.3,
  },
  
  '@mobile': {
    padding: '80px 0',
  }
});

const BlockContent = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
});

const BlockTitle = styled('h2', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  textAlign: 'center',
  margin: '0 0 24px 0',
  lineHeight: 1.2,
  color: 'var(--ifm-color-emphasis-900)',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  color: 'var(--ifm-color-emphasis-600)',
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
  }
});

const LeftCard = styled('div', {
  animation: `${slideInLeft} 0.8s ease-out`,
});

const RightCard = styled('div', {
  animation: `${slideInRight} 0.8s ease-out 0.2s both`,
});

const classTutorialData = {
  icon: 'icon-class',
  title: <Translate id="homepage.preview.class.title">Class 语法教程</Translate>,
  description: <Translate id="homepage.preview.class.description">
    学习如何使用 Class 语法开发 Midway.js 应用
  </Translate>,
  features: [
    <Translate id="homepage.preview.class.feature1">基于装饰器的路由定义</Translate>,
    <Translate id="homepage.preview.class.feature2">依赖注入与服务管理</Translate>,
    <Translate id="homepage.preview.class.feature3">TypeORM 数据库集成</Translate>,
    <Translate id="homepage.preview.class.feature4">组件化开发模式</Translate>
  ],
  href: '/tutorials/class-syntax',
  disabled: true
};

const functionTutorialData = {
  icon: 'icon-function',
  title: <Translate id="homepage.preview.function.title">Function 语法教程</Translate>,
  description: <Translate id="homepage.preview.function.description">
    学习如何使用 Function 语法开发 Midway.js 应用
  </Translate>,
  features: [
    <Translate id="homepage.preview.function.feature1">前后端一体化开发</Translate>,
    <Translate id="homepage.preview.function.feature2">函数式 API 设计</Translate>,
    <Translate id="homepage.preview.function.feature3">React Hooks 后端开发</Translate>,
    <Translate id="homepage.preview.function.feature4">零 API 调用模式</Translate>
  ],
  href: '/tutorials/function-syntax',
  disabled: true
};

function TutorialCardComponent({ data }: { data: typeof classTutorialData }) {
  return (
    <TutorialCard>
      <IconContainer className="icon">
        <Icon className={`iconfont ${data.icon}`} />
      </IconContainer>
      <CardTitle>{data.title}</CardTitle>
      <CardDescription>{data.description}</CardDescription>
      <CardFeatures>
        {data.features.map((feature, index) => (
          <FeatureItem key={index}>{feature}</FeatureItem>
        ))}
      </CardFeatures>
      {data.disabled ? (
        <DisabledButton>
          <Translate id="homepage.preview.comingSoon">
            🚧 即将开放
          </Translate>
        </DisabledButton>
      ) : (
        <StartButton href={data.href}>
          <Translate id="homepage.preview.startLearning">
            开始学习 →
          </Translate>
        </StartButton>
      )}
    </TutorialCard>
  );
}

export function PreviewClassSyntax() {
  return (
    <EnhancedBlock>
      <BlockContent>
        <BlockTitle>
          <Translate id="homepage.preview.title">
            🚧 交互式教程 (开发中)
          </Translate>
        </BlockTitle>
        <BlockSubtitle>
          <Translate id="homepage.preview.subtitle">
            WebContainer 功能正在开发中，即将提供真实的开发环境体验，边学边练，快速掌握 Midway.js
          </Translate>
        </BlockSubtitle>
        
        <Container>
          <LeftCard>
            <TutorialCardComponent data={classTutorialData} />
          </LeftCard>
          <RightCard>
            <TutorialCardComponent data={functionTutorialData} />
          </RightCard>
        </Container>
      </BlockContent>
    </EnhancedBlock>
  );
}

export function PreviewFunctionSyntax() {
  return null; // 这个组件现在不需要了，因为合并到了上面的教程引导中
}
