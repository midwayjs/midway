import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const Container = styled('footer', {
  borderTop: '1px solid var(--midway-border)',
  padding: '80px 0',
  marginTop: '0',
  backgroundColor: 'var(--midway-bg)',
  
  '@mobile': {
    padding: '60px 0',
    marginTop: '0',
  }
})

const Content = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
})

const FooterGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  gap: '40px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '32px',
  }
})

const LogoCol = styled('div', {
  '@mobile': {
    marginBottom: '20px',
  }
})

const Logo = styled('div', {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  marginBottom: '16px',
  letterSpacing: '-0.02em',
})

const Description = styled('p', {
  color: 'var(--midway-text-sec)',
  fontSize: '0.95rem',
  maxWidth: '300px',
  lineHeight: 1.6,
  margin: 0,
})

const Col = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

const ColTitle = styled('h4', {
  color: 'var(--midway-text-main)',
  marginBottom: '20px',
  fontSize: '1rem',
  fontWeight: 700,
})

const Link = styled('a', {
  display: 'block',
  color: 'var(--midway-text-sec)',
  textDecoration: 'none',
  marginBottom: '12px',
  fontSize: '0.95rem',
  transition: 'color 0.2s',
  cursor: 'pointer',
  
  '&:hover': {
    color: 'var(--midway-primary)',
    textDecoration: 'none',
  }
})

const BottomBar = styled('div', {
  marginTop: '60px',
  paddingTop: '20px',
  borderTop: '1px solid var(--midway-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--midway-text-sec)',
  fontSize: '0.85rem',
  
  '@mobile': {
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'center',
  }
})

const Status = styled('span', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.8rem',
  color: 'var(--midway-secondary)',
  letterSpacing: '0.05em',
})

export function Footer() {
  return (
    <Container>
      <Content>
        <FooterGrid>
          <LogoCol>
            <Logo>Midway</Logo>
            <Description>
              <Translate id="homepage.footer.motto">
                Open source Node.js framework designed for the future of web development.
              </Translate>
            </Description>
          </LogoCol>
          
          <Col>
            <ColTitle>Learn</ColTitle>
            <Link href="/docs/intro">Introduction</Link>
            <Link href="/docs/quick_guide">Quick Start</Link>
            <Link href="/docs/upgrade_v3">Migration from v2 to v3</Link>
          </Col>
          
          <Col>
            <ColTitle>Community</ColTitle>
            <Link href="https://space.bilibili.com/1746017680" target="_blank">Bilibili</Link>
            <Link href="https://zhuanlan.zhihu.com/midwayjs" target="_blank">Zhihu</Link>
          </Col>
          
          <Col>
            <ColTitle>More</ColTitle>
            <Link href="/blog">Blog</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="https://github.com/midwayjs/midway" target="_blank">GitHub Issue</Link>
          </Col>
        </FooterGrid>
        
        <BottomBar>
          <span>Copyright © {new Date().getFullYear()} MidwayJS. Built with Docusaurus.</span>
        </BottomBar>
      </Content>
    </Container>
  )
}
