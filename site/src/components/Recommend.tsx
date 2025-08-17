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
  borderRadius: '20px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s ease',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(102, 126, 234, 0.5)',
    
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
    transform: 'translateY(-8px) scale(1.01)',
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
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.4s ease',
});

const CardTitle = styled('h3', {
  color: '#ffffff',
  fontSize: '1.5rem',
  fontWeight: 700,
  textAlign: 'center',
  margin: 0,
  padding: '0 24px',
  transform: 'translateY(20px)',
  opacity: 0,
  transition: 'all 0.4s ease',
});

const EnhancedBlock = styled('div', {
  padding: '120px 0',
  background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 70%, rgba(102, 126, 234, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(118, 75, 162, 0.08) 0%, transparent 50%)',
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
  color: '#2d3748',
  textAlign: 'center',
  margin: '0 0 24px 0',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

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
