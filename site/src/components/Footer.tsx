import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.2 },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const Container = styled('footer', {
  borderTop: '1px solid var(--midway-border)',
  padding: '80px 0',
  marginTop: '0',
  backgroundColor: 'var(--midway-bg)',
  position: 'relative',
  overflow: 'hidden',

  // 顶部高光线
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '30%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--midway-primary), var(--midway-secondary), var(--midway-primary), transparent)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 4s linear infinite`,
  },

  // 点阵背景
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(var(--midway-grid) 1px, transparent 1px)`,
    backgroundSize: '30px 30px',
    opacity: 0.2,
    pointerEvents: 'none',
  },

  '@mobile': {
    padding: '60px 0',
    marginTop: '0',
  }
})

const Content = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  position: 'relative',
  zIndex: 1,

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
  fontSize: '1.6rem',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  marginBottom: '16px',
  letterSpacing: '-0.03em',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',

  '& span': {
    color: 'var(--midway-primary)',
  }
})

const LogoDot = styled('div', {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--midway-secondary)',
  boxShadow: '0 0 8px var(--midway-secondary)',
  animation: `${blink} 2.5s ease-in-out infinite`,
  flexShrink: 0,
})

const Description = styled('p', {
  color: 'var(--midway-text-sec)',
  fontSize: '0.9rem',
  maxWidth: '300px',
  lineHeight: 1.7,
  margin: '0 0 24px 0',
})

const SocialLinks = styled('div', {
  display: 'flex',
  gap: '12px',
})

const SocialLink = styled('a', {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--midway-border)',
  borderRadius: '6px',
  color: 'var(--midway-text-sec)',
  textDecoration: 'none',
  transition: 'all 0.3s',
  fontSize: '16px',

  '&:hover': {
    borderColor: 'var(--midway-primary)',
    color: 'var(--midway-primary)',
    textDecoration: 'none',
    boxShadow: '0 0 12px var(--midway-glow)',
    transform: 'translateY(-2px)',
  }
})

const Col = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

const ColTitle = styled('h4', {
  color: 'var(--midway-text-main)',
  marginBottom: '20px',
  fontSize: '0.95rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '&::before': {
    content: '""',
    width: '12px',
    height: '1px',
    background: 'var(--midway-secondary)',
    display: 'inline-block',
  }
})

const Link = styled('a', {
  display: 'block',
  color: 'var(--midway-text-sec)',
  textDecoration: 'none',
  marginBottom: '10px',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  cursor: 'pointer',
  padding: '2px 0',
  position: 'relative',

  '&::before': {
    content: '""',
    position: 'absolute',
    left: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '0',
    height: '1px',
    background: 'var(--midway-primary)',
    transition: 'width 0.2s',
  },

  '&:hover': {
    color: 'var(--midway-primary)',
    textDecoration: 'none',
    paddingLeft: '14px',

    '&::before': {
      width: '10px',
    }
  }
})

const BottomBar = styled('div', {
  marginTop: '60px',
  paddingTop: '24px',
  borderTop: '1px solid var(--midway-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--midway-text-sec)',
  fontSize: '0.82rem',

  '@mobile': {
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'center',
  }
})

const StatusChip = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.75rem',
  color: 'var(--midway-text-sec)',
  border: '1px solid var(--midway-border)',
  padding: '4px 10px',
  borderRadius: '4px',
  background: 'var(--midway-surface)',
})

const StatusDot = styled('div', {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#27C93F',
  boxShadow: '0 0 6px #27C93F',
  animation: `${blink} 2s ease-in-out infinite`,
})

export function Footer() {
  return (
    <Container>
      <Content>
        <FooterGrid>
          <LogoCol>
            <Logo>
              <LogoDot />
              Midway<span>.js</span>
            </Logo>
            <Description>
              <Translate id="homepage.footer.motto">
                Open source Node.js framework designed for the future of web development.
              </Translate>
            </Description>
            <SocialLinks>
              <SocialLink href="https://github.com/midwayjs/midway" target="_blank" title="GitHub">
                <i className="iconfont icon-github" />
              </SocialLink>
              <SocialLink href="https://space.bilibili.com/1746017680" target="_blank" title="Bilibili">
                <i className="iconfont icon-bilibili" />
              </SocialLink>
              <SocialLink href="https://zhuanlan.zhihu.com/midwayjs" target="_blank" title="Zhihu">
                <i className="iconfont icon-zhihu" />
              </SocialLink>
            </SocialLinks>
          </LogoCol>

          <Col>
            <ColTitle>Learn</ColTitle>
            <Link href="/docs/intro">Introduction</Link>
            <Link href="/docs/quick_guide">Quick Start</Link>
            <Link href="/docs/upgrade_v3">Migration v2 → v3</Link>
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
            <Link href="https://github.com/midwayjs/midway" target="_blank">GitHub Issues</Link>
          </Col>
        </FooterGrid>

        <BottomBar>
          <span>Copyright © {new Date().getFullYear()} MidwayJS. Built with Docusaurus.</span>
          <StatusChip>
            <StatusDot />
            ALL SYSTEMS OPERATIONAL
          </StatusChip>
        </BottomBar>
      </Content>
    </Container>
  )
}
