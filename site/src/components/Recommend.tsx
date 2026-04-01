import React from 'react';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const pulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.02)' },
});

const Container = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
});

const ExtensionCard = styled('a', {
  display: 'block',
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s ease',
  background: 'var(--midway-surface)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--midway-border)',
  position: 'relative',
  
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'var(--midway-primary)',
    boxShadow: '0 0 20px var(--midway-glow)',
    
    '& .extension-image': {
      transform: 'scale(1.05)',
    },
    
    '& .card-overlay': {
      opacity: 1,
    },
    
    '& .card-title': {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  
  '&:active': {
    transform: 'translateY(-2px)',
  },
});

const Extension = styled('img', {
  width: '100%',
  height: 'auto',
  transition: 'transform 0.4s ease',
  display: 'block',
});

const CardOverlay = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.4s ease',
});

const CardTitle = styled('h3', {
  color: 'var(--midway-primary)',
  fontSize: '1.5rem',
  fontWeight: 700,
  textAlign: 'center',
  margin: 0,
  padding: '0 24px',
  transform: 'translateY(20px)',
  opacity: 0,
  transition: 'all 0.4s ease',
  textShadow: '0 0 10px var(--midway-glow)',
});

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  background: 'var(--midway-bg)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `
      linear-gradient(var(--midway-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--midway-grid) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
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
  color: 'var(--midway-text-main)',
  textAlign: 'center',
  margin: '0 0 24px 0',
  textShadow: '0 0 20px var(--midway-glow)',
});

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--midway-text-sec)',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
  }
});

const RecommendList = [
  {
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01IZJkEY1bJrCKViAAc_!!6000000003445-2-tps-600-200.png',
    link: 'https://cool-js.com/',
    title: 'Cool js, 面向未来的后台开发框架',
  },
];

export function Recommend() {
  return (
    <EnhancedBlock>
      <BlockContent>
        <BlockTitle>
          <Translate id="homepage.recommend.title">
            推荐项目
          </Translate>
        </BlockTitle>
        <BlockSubtitle>
          <Translate id="homepage.recommend.subtitle">
            来自开源社区的优秀扩展和项目，与 Midway.js 完美配合
          </Translate>
        </BlockSubtitle>
        
        <Container>
          {RecommendList.map((item, index) => (
            <div key={item.link} style={{ animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both` }}>
              <ExtensionCard href={item.link} target="_blank">
                <Extension 
                  alt={item.title} 
                  src={item.image} 
                  className="extension-image"
                />
                <CardOverlay className="card-overlay">
                  <CardTitle className="card-title">
                    <Translate id="homepage.recommend.cooljs.title">
                      {item.title}
                    </Translate>
                  </CardTitle>
                </CardOverlay>
              </ExtensionCard>
            </div>
          ))}
        </Container>
      </BlockContent>
    </EnhancedBlock>
  );
}
