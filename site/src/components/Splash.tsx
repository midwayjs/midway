import React from 'react';
import { useWindupString } from 'windups';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import Translate from '@docusaurus/Translate';

// ------------------------------------------------------------------
// Animations
// ------------------------------------------------------------------

const gridMove = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '100%': { backgroundPosition: '0 50px' },
});

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const spin = keyframes({
  '100%': { transform: 'rotate(360deg)' },
});

const glowPulse = keyframes({
  '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
  '50%': { opacity: 1, transform: 'scale(1.2)' },
});

// ------------------------------------------------------------------
// Styled Components
// ------------------------------------------------------------------

const Container = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'left',
  padding: '120px 24px 80px',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--midway-bg)',
  color: 'var(--midway-text-main)',
  
  '@mobile': {
    padding: '100px 16px 60px',
    textAlign: 'center',
  },
});

const GridBackground = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `
    linear-gradient(var(--midway-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--midway-grid) 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px',
  transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
  transformOrigin: 'top center',
  opacity: 0.6,
  pointerEvents: 'none',
  zIndex: 0,
  animation: `${gridMove} 20s linear infinite`,
  maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',

  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, transparent 0%, var(--midway-bg) 70%)',
  }
});

const Vignette = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'radial-gradient(circle, transparent 0%, var(--midway-bg) 90%)',
  pointerEvents: 'none',
  zIndex: 1,
});

const Content = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  
  '@mobile': {
    flexDirection: 'column',
    justifyContent: 'center',
  }
});

const TextColumn = styled('div', {
  maxWidth: '800px',
  '@mobile': {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

const Badge = styled('div', {
  display: 'inline-block',
  padding: '6px 12px',
  border: '1px solid var(--midway-primary)',
  color: 'var(--midway-primary)',
  borderRadius: '4px',
  marginBottom: '24px',
  background: 'rgba(0,0,0,0.05)',
  fontSize: '0.9rem',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  animation: `${fadeInUp} 0.8s ease-out`,
});

const Title = styled('h1', {
  fontSize: 'clamp(3rem, 6vw, 5rem)',
  fontWeight: 800,
  lineHeight: 1,
  marginBottom: '24px',
  letterSpacing: '-0.03em',
  background: 'linear-gradient(135deg, var(--midway-text-main) 30%, var(--midway-primary) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
  
  '@mobile': {
    fontSize: '3rem',
  }
});

const SubTitle = styled('p', {
  fontSize: '1.5rem',
  color: 'var(--midway-text-sec)',
  marginBottom: '48px',
  maxWidth: '600px',
  lineHeight: 1.5,
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
  
  '@mobile': {
    fontSize: '1.2rem',
  }
});

const DynamicText = styled('span', {
  color: 'var(--midway-secondary)',
  fontWeight: 700,
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '20px',
  animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
  
  '@mobile': {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '300px',
  }
});

const PrimaryButton = styled('a', {
  position: 'relative',
  padding: '16px 40px',
  background: 'var(--midway-primary)',
  color: 'var(--midway-bg)', // Text color matches background for contrast
  textDecoration: 'none',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
  transition: 'all 0.3s',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 0 20px var(--midway-glow)',
    filter: 'brightness(1.2)',
    color: 'var(--midway-bg)',
    textDecoration: 'none',
  },
});

const SecondaryButton = styled('a', {
  padding: '16px 40px',
  background: 'transparent',
  color: 'var(--midway-text-main)',
  border: '1px solid var(--midway-border)',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s',
  cursor: 'pointer',
  
  '&:hover': {
    borderColor: 'var(--midway-primary)',
    color: 'var(--midway-primary)',
    textDecoration: 'none',
  },
});

const reverseSpin = keyframes({
  '100%': { transform: 'rotate(-360deg)' },
});

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
});

const DecorativeHUD = styled('div', {
  position: 'relative',
  width: '400px',
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  animation: `${fadeInUp} 1s ease-out 0.8s both`,
  
  '@mobile': {
    display: 'none',
  },

  // Outer ring
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '1px solid var(--midway-border)',
    borderRadius: '50%',
    opacity: 0.5,
  },

  // Middle rotating ring
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '80%',
    height: '80%',
    border: '2px dashed var(--midway-primary)',
    borderRadius: '50%',
    animation: `${spin} 30s linear infinite`,
    opacity: 0.3,
  }
});

const InnerCircle = styled('div', {
  position: 'absolute',
  width: '60%',
  height: '60%',
  border: '1px solid var(--midway-secondary)',
  borderRadius: '50%',
  animation: `${reverseSpin} 20s linear infinite`,
  opacity: 0.4,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-5px',
    left: '50%',
    width: '10px',
    height: '10px',
    background: 'var(--midway-secondary)',
    borderRadius: '50%',
    boxShadow: '0 0 10px var(--midway-secondary)',
  }
});

const CenterCrosshair = styled('div', {
  position: 'absolute',
  width: '20px',
  height: '20px',
  
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: 'var(--midway-text-main)',
    opacity: 0.5,
  },
  
  '&::before': {
    top: '9px',
    left: 0,
    width: '100%',
    height: '2px',
  },
  
  '&::after': {
    top: 0,
    left: '9px',
    width: '2px',
    height: '100%',
  }
});

const DataPoint = styled('div', {
  position: 'absolute',
  padding: '4px 8px',
  background: 'var(--midway-surface)',
  border: '1px solid var(--midway-primary)',
  color: 'var(--midway-primary)',
  fontSize: '10px',
  fontFamily: 'monospace',
  borderRadius: '2px',
  animation: `${blink} 2s infinite`,
  
  variants: {
    pos: {
      tl: { top: '10%', left: '0%' },
      tr: { top: '20%', right: '-10%' },
      bl: { bottom: '15%', left: '-5%' },
    }
  }
});

const targets = [
  'Web',
  'Fullstack',
  'Architecture',
  'API',
  'Microservice',
  'Serverless',
];

const scroll = keyframes({
  '0%': { transform: 'translateY(0)', opacity: 1 },
  '100%': { transform: 'translateY(10px)', opacity: 0 },
});

const ScrollIndicator = styled('div', {
  position: 'absolute',
  bottom: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  opacity: 0.7,
  zIndex: 10,
  
  '@mobile': {
    display: 'none',
  }
});

const ScrollText = styled('span', {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--midway-text-sec)',
});

const ScrollArrow = styled('div', {
  width: '1px',
  height: '40px',
  background: 'linear-gradient(to bottom, var(--midway-secondary) 0%, transparent 100%)',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '4px',
    height: '4px',
    background: 'var(--midway-secondary)',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    animation: `${scroll} 2s infinite`,
  }
});

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
      <GridBackground />
      <Vignette />
      
      <Content>
        <TextColumn>
          <Badge>Midway v4.0 // System Ready</Badge>
          
          <Title>
            <Translate id="homepage.splash.titleLine1">Fullstack Framework</Translate>
            <br />
            <Translate id="homepage.splash.titleLine2">For Mission Critical</Translate>
          </Title>
          
          <SubTitle>
            <Translate id="homepage.splash.subtitlePrefix">
              Enterprise-grade Node.js architecture for 
            </Translate>{' '}
            <DynamicText>
              {text}
            </DynamicText>
            <br />
            <Translate id="homepage.splash.subtitleSuffix">
              Build scalable serverless and traditional applications with confidence.
            </Translate>
          </SubTitle>
          
          <ButtonGroup>
            <PrimaryButton href="/docs/intro">
              <Translate id="homepage.splash.primaryBtn">Initialize Project</Translate>
            </PrimaryButton>
            <SecondaryButton href="https://github.com/midwayjs/midway" target="_blank">
              <Translate id="homepage.splash.secondaryBtn">View on GitHub</Translate>
            </SecondaryButton>
          </ButtonGroup>
        </TextColumn>
        
        <DecorativeHUD>
          <InnerCircle />
          <CenterCrosshair />
          <DataPoint pos="tl">SYS.READY</DataPoint>
          <DataPoint pos="tr">V.4.0.0</DataPoint>
          <DataPoint pos="bl">CORE.ACTIVE</DataPoint>
        </DecorativeHUD>
      </Content>

      <ScrollIndicator>
        <ScrollText>Scroll</ScrollText>
        <ScrollArrow />
      </ScrollIndicator>
    </Container>
  );
}
