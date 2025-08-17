import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const float = keyframes({
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
});

const Container = styled('footer', {
  background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '80px 24px 60px',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.15) 0%, transparent 50%)',
  },
  
  '@mobile': {
    padding: '60px 16px 40px',
  }
})

const Content = styled('div', {
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  maxWidth: '800px',
})

const Title = styled('h2', {
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 32px 0',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: `${fadeInUp} 0.8s ease-out`,
  lineHeight: 1.2,
})

const Motto = styled('p', {
  fontSize: '1.25rem',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0 0 48px 0',
  lineHeight: 1.6,
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
  maxWidth: '600px',
})

const Links = styled('div', {
  display: 'flex',
  gap: '32px',
  marginBottom: '48px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
  
  '@mobile': {
    gap: '24px',
    marginBottom: '40px',
  }
})

const Link = styled('a', {
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  padding: '8px 16px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  
  '&:hover': {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
  },
})

const Tip = styled('div', {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.6)',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
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
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.05)',
  animation: `${float} 8s ease-in-out infinite`,
  
  '&:nth-child(1)': {
    top: '20%',
    left: '15%',
    animationDelay: '0s',
    animationDuration: '10s',
  },
  '&:nth-child(2)': {
    top: '70%',
    right: '20%',
    animationDelay: '3s',
    animationDuration: '12s',
  },
  '&:nth-child(3)': {
    bottom: '20%',
    left: '25%',
    animationDelay: '6s',
    animationDuration: '14s',
  },
})

export function Footer() {
  return (
    <Container>
      <FloatingElements>
        <FloatingElement />
        <FloatingElement />
        <FloatingElement />
      </FloatingElements>
      
      <Content>
        <Title>
          <Translate id="homepage.footer.title">
            Develop. Build. Ship.
          </Translate>
        </Title>
        <Motto>
          <Translate id="homepage.footer.motto">
            让 Node.js 开发更加高效，让应用部署更加简单
          </Translate>
        </Motto>
      </Content>
    </Container>
  )
}
