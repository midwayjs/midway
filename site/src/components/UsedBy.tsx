import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Marquee from 'react-fast-marquee'
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const float = keyframes({
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
});

const BrandImage = styled('img', {
  height: '64px',
  display: 'inline-block',
  marginRight: '64px',
  opacity: 0.8,
  transition: 'all 0.4s ease',
  filter: 'grayscale(100%) brightness(1.2)',
  borderRadius: '4px',
  
  '&:hover': {
    filter: 'grayscale(0%) brightness(1.2)',
    opacity: 1,
    transform: 'scale(1.1) translateY(-4px)',
    boxShadow: '0 0 20px var(--midway-glow)',
  },
  
  '@mobile': {
    height: '42px',
    marginRight: '42px',
  }
})

const BrandIcon = styled('i', {
  fontSize: '64px',
  color: 'var(--midway-text-sec)',
  display: 'inline-block',
  marginRight: '64px',
  opacity: 0.8,
  transition: 'all 0.4s ease',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  
  '&:hover': {
    opacity: 1,
    color: 'var(--midway-primary)',
    transform: 'scale(1.1) translateY(-4px)',
    textShadow: '0 0 20px var(--midway-glow)',
  },
  
  '@mobile': {
    fontSize: '42px',
    marginRight: '42px',
  }
})

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
})

const BlockContent = styled('div', {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  
  '@mobile': {
    padding: '0 16px',
  }
})

const BlockTitle = styled('h2', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  textAlign: 'center',
  margin: '0 0 24px 0',
  animation: `${fadeInUp} 0.8s ease-out`,
  textShadow: '0 0 20px var(--midway-glow)',
})

const BlockSubtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--midway-text-sec)',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 80px',
  lineHeight: 1.6,
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
  
  '@mobile': {
    fontSize: '1.1rem',
    marginBottom: '60px',
  }
})

const MarqueeContainer = styled('div', {
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
  padding: '20px 0',
  
  '& .marquee': {
    '&:hover': {
      '& img, & i': {
        filter: 'grayscale(0%) brightness(1.2)',
        opacity: 1,
        transform: 'scale(1.05)',
      }
    }
  }
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
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: '1px solid var(--midway-border)',
  background: 'transparent',
  animation: `${float} 10s ease-in-out infinite`,
  opacity: 0.3,
  
  '&:nth-child(1)': {
    top: '15%',
    left: '10%',
    animationDelay: '0s',
    animationDuration: '12s',
    borderColor: 'var(--midway-primary)',
  },
  '&:nth-child(2)': {
    top: '65%',
    right: '15%',
    animationDelay: '4s',
    animationDuration: '15s',
    borderColor: 'var(--midway-secondary)',
  },
  '&:nth-child(3)': {
    bottom: '25%',
    left: '20%',
    animationDelay: '8s',
    animationDuration: '18s',
    borderColor: 'var(--midway-text-sec)',
  },
})

const brands = [
  'icon-tianmaotmall',
  'icon-gaodeditu-quan',
  'icon-feizhulogo',
  'icon-credit_taobao_icon',
  'icon-zijietiaodong',
  'icon-dcaadaacdcabasvg',
  'icon-is-aliyun_logo',
  'icon-vivo',
  'https://img.alicdn.com/imgextra/i3/O1CN015RbnOy1GX2fWWaBbs_!!6000000000631-2-tps-614-200.png',
  'https://img.alicdn.com/imgextra/i4/O1CN01RpFMeb1LiYexaZIcP_!!6000000001333-2-tps-320-150.png',
  'https://img.alicdn.com/imgextra/i3/O1CN010wn80L1UR01GSABXa_!!6000000002513-2-tps-277-121.png',
  'https://img.alicdn.com/imgextra/i3/O1CN01vsbUzd1T9J6X9VBg7_!!6000000002339-2-tps-400-400.png',
  'https://img.alicdn.com/imgextra/i1/O1CN01zw2fMc2266tFQCFQr_!!6000000007070-2-tps-704-255.png',
  'https://img.alicdn.com/imgextra/i4/O1CN01RiM9ex1hyycitrJHV_!!6000000004347-2-tps-890-310.png',
]

export function UsedBy() {
  return (
    <EnhancedBlock>
      <FloatingElements>
        <FloatingElement />
        <FloatingElement />
        <FloatingElement />
      </FloatingElements>
      
      <BlockContent>
        <BlockTitle>
          <Translate id="homepage.usedby.title">
            信任我们的团队
          </Translate>
        </BlockTitle>
        <BlockSubtitle>
          <Translate id="homepage.usedby.subtitle">
            来自各大互联网公司的优秀团队都在使用 Midway.js，共同构建更好的应用
          </Translate>
        </BlockSubtitle>
        
        <MarqueeContainer>
          <Marquee gradient={false} speed={40}>
            {renderMarquee(brands)}
          </Marquee>
        </MarqueeContainer>
      </BlockContent>
    </EnhancedBlock>
  )
}

function renderMarquee(brands: string[]) {
  return (
    <>
      {brands.map((brand, index) => {
        if (brand.startsWith('http')) {
          return <BrandImage key={index} src={brand} alt="Brand" />
        }
        return <BrandIcon key={index} className={`iconfont ${brand}`} />
      })}
    </>
  )
}
