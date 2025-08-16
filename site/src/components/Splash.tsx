import React from 'react';
import { useWindupString, CharWrapper } from 'windups';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';

const gradientAnimation = keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
  '100%': { backgroundPosition: '0% 50%' },
});

const floatAnimation = keyframes({
  '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1) rotate(0deg)' },
  '25%': { transform: 'translateY(-20px) translateX(10px) scale(1.05) rotate(2deg)' },
  '50%': { transform: 'translateY(-15px) translateX(-5px) scale(0.95) rotate(-1deg)' },
  '75%': { transform: 'translateY(-25px) translateX(15px) scale(1.1) rotate(3deg)' },
});

const rotateAnimation = keyframes({
  '0%': { transform: 'rotate(0deg) scale(1) translateX(0px)' },
  '33%': { transform: 'rotate(120deg) scale(1.1) translateX(10px)' },
  '66%': { transform: 'rotate(240deg) scale(0.9) translateX(-5px)' },
  '100%': { transform: 'rotate(360deg) scale(1) translateX(0px)' },
});

const pulseAnimation = keyframes({
  '0%, 100%': { transform: 'scale(1) rotate(45deg) translateY(0px)' },
  '25%': { transform: 'scale(1.1) rotate(45deg) translateY(-8px)' },
  '50%': { transform: 'scale(0.9) rotate(45deg) translateY(5px)' },
  '75%': { transform: 'scale(1.05) rotate(45deg) translateY(-3px)' },
});

const circleFloatAnimation = keyframes({
  '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1) rotate(0deg)' },
  '33%': { transform: 'translateY(-15px) translateX(8px) scale(1.08) rotate(180deg)' },
  '66%': { transform: 'translateY(-8px) translateX(-12px) scale(0.92) rotate(360deg)' },
});

const slideAnimation = keyframes({
  '0%': { 
    transform: 'translateX(-100px) translateY(0px) scale(1) rotate(0deg)',
    opacity: 0.3,
  },
  '25%': { 
    transform: 'translateX(-50px) translateY(-20px) scale(1.2) rotate(90deg)',
    opacity: 0.8,
  },
  '50%': { 
    transform: 'translateX(0px) translateY(0px) scale(0.8) rotate(180deg)',
    opacity: 1,
  },
  '75%': { 
    transform: 'translateX(50px) translateY(20px) scale(1.1) rotate(270deg)',
    opacity: 0.8,
  },
  '100%': { 
    transform: 'translateX(100vw) translateY(0px) scale(1) rotate(360deg)',
    opacity: 0.3,
  },
});

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const pulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
});

const Container = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '120px 24px 80px',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--ifm-color-background)',
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 15s ease infinite`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, var(--ifm-color-emphasis-300) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--ifm-color-emphasis-400) 0%, transparent 50%)',
    zIndex: 1,
    opacity: 0.6,
  },

  '@mobile': {
    padding: '80px 16px 60px',
    minHeight: '90vh',
  },
});

const BackgroundElements = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1,
  overflow: 'hidden',
});

const Bubble = styled('div', {
  position: 'absolute',
  borderRadius: '50%',
  background: 'var(--ifm-color-emphasis-300)',
  backdropFilter: 'blur(5px)',
  border: '1px solid var(--ifm-color-emphasis-400)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  opacity: 0.6,
  
  // 浅色主题下的特殊样式
  '@media (prefers-color-scheme: light)': {
    background: 'var(--ifm-color-emphasis-400)',
    border: '1px solid var(--ifm-color-emphasis-500)',
    opacity: 0.8,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  
  // 深色主题下的特殊样式
  '@media (prefers-color-scheme: dark)': {
    opacity: 0.4,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  
  variants: {
    size: {
      small: {
        width: '20px',
        height: '20px',
      },
      medium: {
        width: '40px',
        height: '40px',
      },
      large: {
        width: '60px',
        height: '60px',
      },
    },
    animation: {
      float1: {
        animation: `${floatAnimation} 12s ease-in-out infinite`,
      },
      float2: {
        animation: `${floatAnimation} 18s ease-in-out infinite`,
      },
      float3: {
        animation: `${floatAnimation} 24s ease-in-out infinite`,
      },
    },
  },
});

const GeometricShape = styled('div', {
  position: 'absolute',
  opacity: 0.15,
  
  variants: {
    type: {
      triangle: {
        width: 0,
        height: 0,
        borderLeft: '25px solid transparent',
        borderRight: '25px solid transparent',
        borderBottom: '43px solid var(--ifm-color-emphasis-600)',
        animation: `${rotateAnimation} 25s linear infinite`,
        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
      },
      square: {
        width: '30px',
        height: '30px',
        background: 'var(--ifm-color-emphasis-500)',
        transform: 'rotate(45deg)',
        animation: `${pulseAnimation} 8s ease-in-out infinite`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
      circle: {
        width: '25px',
        height: '25px',
        borderRadius: '50%',
        background: 'var(--ifm-color-emphasis-500)',
        animation: `${circleFloatAnimation} 12s ease-in-out infinite`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
});

const FloatingParticle = styled('div', {
  position: 'absolute',
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: 'var(--ifm-color-emphasis-600)',
  animation: `${slideAnimation} 12s linear infinite`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  
  variants: {
    delay: {
      delay1: { animationDelay: '0s' },
      delay2: { animationDelay: '3s' },
      delay3: { animationDelay: '6s' },
      delay4: { animationDelay: '9s' },
    },
  },
});

const FloatingElements = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1,
});

const FloatingElement = styled('div', {
  position: 'absolute',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'var(--ifm-color-emphasis-300)',
  animation: `${floatAnimation} 15s ease-in-out infinite`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  
  '&:nth-child(1)': {
    top: '20%',
    left: '10%',
    animationDelay: '0s',
    animationDuration: '20s',
  },
  '&:nth-child(2)': {
    top: '60%',
    right: '15%',
    animationDelay: '5s',
    animationDuration: '25s',
  },
  '&:nth-child(3)': {
    bottom: '30%',
    left: '20%',
    animationDelay: '10s',
    animationDuration: '30s',
  },
});

const Content = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  width: '100%',
});

const Title = styled('h1', {
  fontSize: 'clamp(3rem, 8vw, 6rem)',
  fontWeight: 800,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 16px 0',
  textShadow: '0 4px 20px var(--ifm-color-emphasis-200), 0 2px 8px rgba(0, 0, 0, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  letterSpacing: '-0.02em',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const SubTitle = styled('h2', {
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  fontWeight: 600,
  color: 'var(--ifm-color-emphasis-800)',
  margin: '0 auto 48px',
  maxWidth: '800px',
  lineHeight: 1.3,
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: '8px',
});

const DynamicTextContainer = styled('div', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: '2px',
  minHeight: '60px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  flexShrink: 0,
  margin: '0 4px',
});

const Description = styled('span', {
  display: 'inline-block',
  color: 'var(--ifm-color-emphasis-900)',
  fontWeight: 700,
  textShadow: '0 2px 10px var(--ifm-color-emphasis-200), 0 1px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  whiteSpace: 'nowrap',
  
  '&:hover': {
    transform: 'scale(1.1)',
    color: 'var(--ifm-color-primary)',
  },
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '24px',
  marginTop: '48px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
  
  '@mobile': {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
});

const Button = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 32px',
  borderRadius: '50px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  minWidth: '180px',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover::before': {
    left: '100%',
  },
  
  variants: {
    type: {
      primary: {
        backgroundColor: 'var(--ifm-color-primary)',
        color: 'var(--ifm-color-primary-contrast-foreground)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
        },
      },
      secondary: {
        backgroundColor: 'var(--ifm-color-emphasis-200)',
        color: 'var(--ifm-color-emphasis-800)',
        border: '2px solid var(--ifm-color-emphasis-300)',
        backdropFilter: 'blur(10px)',
        
        '&:hover': {
          backgroundColor: 'var(--ifm-color-emphasis-300)',
          borderColor: 'var(--ifm-color-emphasis-400)',
          transform: 'translateY(-2px)',
        },
      },
      beta: {
        backgroundColor: '#00d4aa',
        color: '#ffffff',
        boxShadow: '0 8px 32px rgba(0, 212, 170, 0.3)',
        
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0, 212, 170, 0.4)',
        },
      },
    },
  },
});

const Icon = styled('i', {
  fontSize: '1.2rem',
  marginRight: '8px',
});

const VersionInfo = styled('div', {
  marginTop: '32px',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
});

const VersionText = styled('p', {
  fontSize: '0.9rem',
  color: 'var(--ifm-color-emphasis-600)',
  margin: '0 0 16px 0',
});

const VersionButtons = styled('div', {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  
  '@mobile': {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  }
});

const VersionButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  border: '1px solid var(--ifm-color-emphasis-300)',
  
  variants: {
    type: {
      stable: {
        backgroundColor: 'var(--ifm-color-emphasis-200)',
        color: 'var(--ifm-color-emphasis-800)',
        
        '&:hover': {
          backgroundColor: 'var(--ifm-color-emphasis-300)',
          borderColor: 'var(--ifm-color-emphasis-400)',
        },
      },
      beta: {
        backgroundColor: 'rgba(0, 212, 170, 0.2)',
        color: '#00d4aa',
        borderColor: 'rgba(0, 212, 170, 0.5)',
        
        '&:hover': {
          backgroundColor: 'rgba(0, 212, 170, 0.3)',
          borderColor: 'rgba(0, 212, 170, 0.7)',
        },
      },
    },
  },
});

const StarContainer = styled('div', {
  marginTop: '48px',
  animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
});

const targets = [
  'Web',
  'Fullstack',
  'Architecture',
  'API',
  'Production',
  'Microservice',
  'Serverless',
  'Speed',
  'Efficiency',
  'Developer',
  'Experience',
];

export function Splash() {
  const [index, setIndex] = React.useState(0);

  const [text] = useWindupString(targets[index], {
    onFinished() {
      const nextIndex = index === targets.length - 1 ? 0 : index + 1;
      setTimeout(() => {
        setIndex(nextIndex);
      }, 3000);
    },
    pace: () => 100,
  });

  return (
    <Container>
      <BackgroundElements>
        {/* 气泡元素 */}
        <Bubble size="small" animation="float1" style={{ top: '15%', left: '5%' }} />
        <Bubble size="medium" animation="float2" style={{ top: '25%', right: '10%' }} />
        <Bubble size="large" animation="float3" style={{ top: '70%', left: '8%' }} />
        <Bubble size="small" animation="float1" style={{ top: '80%', right: '20%' }} />
        <Bubble size="medium" animation="float2" style={{ top: '40%', left: '25%' }} />
        <Bubble size="small" animation="float3" style={{ top: '60%', right: '5%' }} />
        
        {/* 几何图形 */}
        <GeometricShape type="triangle" style={{ top: '10%', right: '25%' }} />
        <GeometricShape type="square" style={{ top: '85%', left: '15%' }} />
        <GeometricShape type="circle" style={{ top: '45%', right: '35%' }} />
        <GeometricShape type="triangle" style={{ top: '75%', right: '45%' }} />
        <GeometricShape type="square" style={{ top: '20%', left: '40%' }} />
        
        {/* 浮动粒子 */}
        <FloatingParticle delay="delay1" style={{ top: '30%' }} />
        <FloatingParticle delay="delay2" style={{ top: '50%' }} />
        <FloatingParticle delay="delay3" style={{ top: '70%' }} />
        <FloatingParticle delay="delay4" style={{ top: '90%' }} />
      </BackgroundElements>
      
      {/* <FloatingElements>
        <FloatingElement />
        <FloatingElement />
        <FloatingElement />
      </FloatingElements> */}
      
      <Content>
        <Title>Midway</Title>
        <SubTitle>
          Node.js Framework For "
          <DynamicTextContainer>
            {text.split('').map((char, index) => (
              <Description key={char + index}>{char}</Description>
            ))}
          </DynamicTextContainer>
          "
        </SubTitle>
        
        <VersionInfo>
          <VersionButtons>
            <VersionButton type="stable" href="/docs/intro">
              📖 稳定版文档 (v3.x)
            </VersionButton>
            <VersionButton type="beta" href="/docs/next/intro">
              🚧 Beta 版文档 (v4)
            </VersionButton>
          </VersionButtons>
        </VersionInfo>
        
        <StarContainer>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=midwayjs&repo=midway&type=star&count=true&size=large"
            frameBorder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
            style={{ filter: 'invert(1)' }}
          />
        </StarContainer>
      </Content>
    </Container>
  );
}
