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

const reverseSpin = keyframes({
  '100%': { transform: 'rotate(-360deg)' },
});

const glowPulse = keyframes({
  '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
  '50%': { opacity: 0.9, transform: 'scale(1.15)' },
});

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
});

const scanLine = keyframes({
  '0%': { top: '-10%', opacity: 0.6 },
  '80%': { opacity: 0.6 },
  '100%': { top: '110%', opacity: 0 },
});

const particleFloat = keyframes({
  '0%': { transform: 'translateY(0px) translateX(0px)', opacity: 0 },
  '10%': { opacity: 1 },
  '90%': { opacity: 1 },
  '100%': { transform: 'translateY(-80px) translateX(20px)', opacity: 0 },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const cornerExpand = keyframes({
  '0%': { width: '10px', height: '10px', opacity: 0.4 },
  '50%': { width: '24px', height: '24px', opacity: 1 },
  '100%': { width: '10px', height: '10px', opacity: 0.4 },
});

const radarSweep = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const scroll = keyframes({
  '0%': { transform: 'translateY(0)', opacity: 1 },
  '100%': { transform: 'translateY(10px)', opacity: 0 },
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

// 环境光晕 - 主光源
const AmbientGlow = styled('div', {
  position: 'absolute',
  top: '-10%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '900px',
  height: '600px',
  background: 'radial-gradient(ellipse, var(--midway-glow) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 1,
  animation: `${glowPulse} 6s ease-in-out infinite`,
  opacity: 0.6,
});

// 左侧次级光晕
const SideGlowLeft = styled('div', {
  position: 'absolute',
  top: '20%',
  left: '-15%',
  width: '500px',
  height: '500px',
  background: 'radial-gradient(circle, rgba(74, 0, 224, 0.08) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 1,
  animation: `${glowPulse} 9s ease-in-out infinite 2s`,

  '[data-theme="dark"] &': {
    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 70%)',
  }
});

// 右侧次级光晕
const SideGlowRight = styled('div', {
  position: 'absolute',
  bottom: '10%',
  right: '-10%',
  width: '400px',
  height: '400px',
  background: 'radial-gradient(circle, rgba(0, 210, 255, 0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 1,
  animation: `${glowPulse} 12s ease-in-out infinite 4s`,

  '[data-theme="dark"] &': {
    background: 'radial-gradient(circle, rgba(188, 19, 254, 0.06) 0%, transparent 70%)',
  }
});

// 全局扫描线
const ScanLineOverlay = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 2,
  overflow: 'hidden',

  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, var(--midway-primary), transparent)',
    opacity: 0,
    top: '0%',
    animation: `${scanLine} 8s linear infinite`,
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
  zIndex: 3,
  maxWidth: '1200px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '40px',

  '@mobile': {
    flexDirection: 'column',
    justifyContent: 'center',
  }
});

const TextColumn = styled('div', {
  maxWidth: '640px',
  '@mobile': {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

const Badge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  border: '1px solid var(--midway-primary)',
  color: 'var(--midway-primary)',
  borderRadius: '4px',
  marginBottom: '24px',
  background: 'rgba(0,0,0,0.05)',
  fontSize: '0.85rem',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  animation: `${fadeInUp} 0.8s ease-out`,
  position: 'relative',
  overflow: 'hidden',

  // shimmer effect
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s linear infinite`,
  }
});

const BadgeDot = styled('div', {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--midway-secondary)',
  boxShadow: '0 0 6px var(--midway-secondary)',
  animation: `${blink} 2s infinite`,
  flexShrink: 0,
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
  fontSize: '1.25rem',
  color: 'var(--midway-text-sec)',
  marginBottom: '48px',
  maxWidth: '570px',
  lineHeight: 1.6,
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,

  '@mobile': {
    fontSize: '1.1rem',
  }
});

const DynamicText = styled('span', {
  color: 'var(--midway-secondary)',
  fontWeight: 700,
  textShadow: '0 0 20px var(--midway-secondary)',
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '16px',
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
  color: 'var(--midway-bg)',
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
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 0 30px var(--midway-glow), 0 8px 20px rgba(0,0,0,0.3)',
    filter: 'brightness(1.15)',
    color: 'var(--midway-bg)',
    textDecoration: 'none',

    '&::before': { left: '100%' },
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
  gap: '8px',
  transition: 'all 0.3s',
  cursor: 'pointer',

  '&:hover': {
    borderColor: 'var(--midway-primary)',
    color: 'var(--midway-primary)',
    textDecoration: 'none',
    boxShadow: '0 0 15px var(--midway-glow)',
  },
});

// ── Stats Row ─────────────────────────────────────────────────────────
const StatsRow = styled('div', {
  display: 'flex',
  gap: '32px',
  marginTop: '60px',
  paddingTop: '40px',
  borderTop: '1px solid var(--midway-border)',
  animation: `${fadeInUp} 0.8s ease-out 0.8s both`,

  '@mobile': {
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  }
});

const StatItem = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const StatValue = styled('div', {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  letterSpacing: '-0.02em',

  '& span': {
    color: 'var(--midway-secondary)',
  }
});

const StatLabel = styled('div', {
  fontSize: '0.75rem',
  color: 'var(--midway-text-sec)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
});

// ── HUD Components ────────────────────────────────────────────────────

const DecorativeHUD = styled('div', {
  position: 'relative',
  width: '420px',
  height: '420px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  animation: `${fadeInUp} 1s ease-out 0.8s both`,
  flexShrink: 0,

  '@mobile': {
    display: 'none',
  },

  // Outer static ring
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '1px solid var(--midway-border)',
    borderRadius: '50%',
    opacity: 0.4,
  },
});

// 雷达外框 - 查看不同尺寸的版本
const RadarRing = styled('div', {
  position: 'absolute',
  borderRadius: '50%',
  border: '1px solid',

  variants: {
    size: {
      // 最外圈 — 静态素色圆圆
      outer: {
        width: '100%',
        height: '100%',
        borderColor: 'var(--midway-border)',
        opacity: 0.35,
      },
      // 中圈 — PRIMARY 色虚线旋转圆
      mid: {
        width: '72%',
        height: '72%',
        borderColor: 'var(--midway-primary)',
        borderStyle: 'dashed',
        opacity: 0.5,
        animation: `${spin} 30s linear infinite`,
      },
      // 内圈 — 实线素色圆，与 mid 大小差异明显
      inner: {
        width: '44%',
        height: '44%',
        borderColor: 'var(--midway-secondary)',
        borderStyle: 'solid',
        opacity: 0.45,
        animation: `${reverseSpin} 18s linear infinite`,
      },
      // 最内边界圆
      core: {
        width: '18%',
        height: '18%',
        borderColor: 'var(--midway-secondary)',
        opacity: 0.6,
        background: 'radial-gradient(circle, var(--midway-glow) 0%, transparent 70%)',
      }
    }
  }
});

// 菱形内圆：方块旋转45°，形态与圆形环完全不同
const DiamondRing = styled('div', {
  position: 'absolute',
  width: '28%',
  height: '28%',
  border: '1px solid var(--midway-secondary)',
  borderRadius: '3px',
  opacity: 0.5,
  transform: 'rotate(45deg)',
  animation: `${spin} 12s linear infinite`,
  boxShadow: '0 0 8px var(--midway-secondary), inset 0 0 8px var(--midway-glow)',
});

// 雷达扫描扇形
const RadarSweep = styled('div', {
  position: 'absolute',
  width: '50%',
  height: '50%',
  top: '0%',
  left: '50%',
  transformOrigin: '0% 100%',
  background: 'conic-gradient(from 0deg, transparent 70%, var(--midway-primary) 100%)',
  borderRadius: '0 100% 0 0',
  opacity: 0.15,
  animation: `${radarSweep} 6s linear infinite`,
});

// 雷达中心光点
const RadarCenter = styled('div', {
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--midway-secondary)',
  boxShadow: '0 0 10px var(--midway-secondary), 0 0 20px var(--midway-secondary)',
  animation: `${glowPulse} 3s ease-in-out infinite`,
});

// 轨道上的卫星点
const OrbitDot = styled('div', {
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '50%',

  variants: {
    track: {
      primary: {
        top: '-4px',
        left: 'calc(50% - 4px)',
        background: 'var(--midway-primary)',
        boxShadow: '0 0 8px var(--midway-primary)',
      },
      secondary: {
        top: 'calc(50% - 4px)',
        right: '-4px',
        background: 'var(--midway-secondary)',
        boxShadow: '0 0 8px var(--midway-secondary)',
      }
    }
  }
});

// 连接线 (十字准心)
const Crosshair = styled('div', {
  position: 'absolute',
  width: '30px',
  height: '30px',

  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: 'var(--midway-text-main)',
    opacity: 0.4,
  },

  '&::before': {
    top: '14px',
    left: 0,
    width: '100%',
    height: '2px',
  },

  '&::after': {
    top: 0,
    left: '14px',
    width: '2px',
    height: '100%',
  }
});

// HUD 刻度线
const TickMark = styled('div', {
  position: 'absolute',
  width: '2px',
  background: 'var(--midway-primary)',
  opacity: 0.5,
  transformOrigin: 'center bottom',

  variants: {
    len: {
      short: { height: '6px', bottom: 'calc(50% - 3px)' },
      long: { height: '12px', bottom: 'calc(50% - 6px)' },
    }
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
  backdropFilter: 'blur(8px)',
  animation: `${blink} 2s infinite`,
  letterSpacing: '0.05em',

  variants: {
    pos: {
      tl: { top: '8%', left: '-2%' },
      tr: { top: '18%', right: '-8%' },
      bl: { bottom: '13%', left: '-4%' },
      br: { bottom: '20%', right: '-5%' },
    }
  }
});

// 粒子（散布在 HUD 周围的光点）
const Particle = styled('div', {
  position: 'absolute',
  width: '3px',
  height: '3px',
  borderRadius: '50%',
  background: 'var(--midway-secondary)',
  opacity: 0,
  animation: `${particleFloat} 4s ease-in-out infinite`,

  variants: {
    idx: {
      '1': { bottom: '20%', left: '8%', animationDelay: '0s', animationDuration: '5s' },
      '2': { bottom: '30%', left: '15%', animationDelay: '1s', animationDuration: '4s' },
      '3': { bottom: '15%', right: '10%', animationDelay: '2s', animationDuration: '6s' },
      '4': { bottom: '40%', right: '5%', animationDelay: '0.5s', animationDuration: '3.5s' },
      '5': { bottom: '10%', left: '40%', animationDelay: '1.5s', animationDuration: '5.5s' },
    }
  }
});

// ── Scroll Indicator ─────────────────────────────────────────────────
const ScrollIndicator = styled('div', {
  position: 'absolute',
  bottom: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  opacity: 0.6,
  zIndex: 10,

  '@mobile': {
    display: 'none',
  }
});

const ScrollText = styled('span', {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.25em',
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
    width: '5px',
    height: '5px',
    background: 'var(--midway-secondary)',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 6px var(--midway-secondary)',
    animation: `${scroll} 2s infinite`,
  }
});

// ── HUD Tick Marks Helper ─────────────────────────────────────────────
function HUDTickMarks() {
  const ticks = Array.from({ length: 36 });
  return (
    <>
      {ticks.map((_, i) => {
        const angle = i * 10;
        const isLong = i % 9 === 0;
        return (
          <TickMark
            key={i}
            len={isLong ? 'long' : 'short'}
            style={{
              transform: `rotate(${angle}deg) translateX(-50%)`,
              left: '50%',
              opacity: isLong ? 0.7 : 0.35,
            }}
          />
        );
      })}
    </>
  );
}

const targets = [
  'Web',
  'Fullstack',
  'Architecture',
  'API',
  'Microservice',
  'Serverless',
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
      <GridBackground />
      <Vignette />
      <AmbientGlow />
      <SideGlowLeft />
      <SideGlowRight />
      <ScanLineOverlay />

      <Content>
        <TextColumn>
          <Badge>
            <BadgeDot />
            Midway v4.0 // System Ready
          </Badge>

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <Translate id="homepage.splash.secondaryBtn">View on GitHub</Translate>
            </SecondaryButton>
          </ButtonGroup>

          <StatsRow>
            <StatItem>
              <StatValue>7<span>K+</span></StatValue>
              <StatLabel>GitHub Stars</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>4<span>M+</span></StatValue>
              <StatLabel>Monthly Downloads</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>v4<span>.0</span></StatValue>
              <StatLabel>Latest Release</StatLabel>
            </StatItem>
          </StatsRow>
        </TextColumn>

        {/* ── Decorative HUD ── */}
        <DecorativeHUD>
          {/* Radar rings */}
          <RadarRing size="outer" />
          <RadarRing size="mid">
            <OrbitDot track="primary" />
          </RadarRing>
          <RadarRing size="inner">
            <OrbitDot track="secondary" />
          </RadarRing>

          {/* Radar sweep + single center dot */}
          <RadarSweep />
          <RadarCenter />

          {/* Data labels */}
          <DataPoint pos="tl">SYS.READY</DataPoint>
          <DataPoint pos="tr" style={{ animationDelay: '0.5s' }}>V.4.0.0</DataPoint>
          <DataPoint pos="bl" style={{ animationDelay: '1s' }}>CORE.ACTIVE</DataPoint>
          <DataPoint pos="br" style={{ animationDelay: '1.5s' }}>NET: ONLINE</DataPoint>

          {/* Floating particles */}
          <Particle idx="1" />
          <Particle idx="2" />
          <Particle idx="3" />
          <Particle idx="4" />
          <Particle idx="5" />
        </DecorativeHUD>
      </Content>

      <ScrollIndicator>
        <ScrollText>Scroll</ScrollText>
        <ScrollArrow />
      </ScrollIndicator>
    </Container>
  );
}
