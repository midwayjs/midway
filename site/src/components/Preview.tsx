import React from 'react';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const scanDown = keyframes({
  '0%': { top: '0%', opacity: 0.5 },
  '80%': { opacity: 0.5 },
  '100%': { top: '100%', opacity: 0 },
});

const cursorBlink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const glowPulse = keyframes({
  '0%, 100%': { boxShadow: '0 20px 50px rgba(0,0,0,0.2), 0 0 0 1px var(--midway-border)' },
  '50%': { boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 20px var(--midway-glow), 0 0 0 1px var(--midway-secondary)' },
});

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '72px',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto 140px',
  padding: '120px 24px 0',

  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '40px',
    padding: '60px 16px 0',
    marginBottom: '80px',
  }
});

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.85rem',
  color: 'var(--midway-secondary)',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '20px',
    height: '1px',
    background: 'var(--midway-secondary)',
  }
})

const Title = styled('h2', {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 16px 0',
  display: 'inline-block',
  position: 'relative',

  '&::after': {
    content: '""',
    display: 'block',
    width: '40%',
    height: '4px',
    background: 'linear-gradient(90deg, var(--midway-secondary), transparent)',
    marginTop: '10px',
    borderRadius: '2px',
  }
})

const Description = styled('p', {
  fontSize: '1.05rem',
  color: 'var(--midway-text-sec)',
  marginBottom: '28px',
  lineHeight: 1.7,
})

const EcoStrip = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '32px',
})

const EcoTag = styled('div', {
  padding: '7px 16px',
  border: '1px solid var(--midway-border)',
  color: 'var(--midway-text-sec)',
  fontSize: '0.85rem',
  background: 'var(--midway-surface)',
  cursor: 'default',
  transition: 'all 0.3s',
  borderRadius: '4px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  letterSpacing: '0.02em',

  '&:hover': {
    borderColor: 'var(--midway-secondary)',
    color: 'var(--midway-secondary)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px var(--midway-glow)',
    background: 'rgba(0,0,0,0.05)',
  }
})

const StartButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '13px 22px',
  marginTop: 0,
  backgroundColor: 'var(--midway-primary)',
  color: '#ffffff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'all 0.25s ease',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    transition: 'left 0.4s',
  },

  '&:hover': {
    backgroundColor: 'var(--midway-secondary)',
    color: '#000000',
    textDecoration: 'none',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px var(--midway-glow)',

    '&::before': { left: '100%' },
  },
})

const StartButtonGroup = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '28px',
})

const MobileFirstPanel = styled('div', {
  '@mobile': { order: 1 },
})

// ── Code Window ───────────────────────────────────────────────────────

const CodeWindowWrapper = styled('div', {
  position: 'relative',

  // 外发光装饰
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--midway-primary), var(--midway-secondary))',
    opacity: 0,
    transition: 'opacity 0.4s',
    zIndex: -1,
  },

  '&:hover::before': {
    opacity: 0.2,
  }
})

const CodeWindow = styled('div', {
  // 亮色：GitHub Light 风格；暗色：Cyber Dark
  background: '#F6F8FA',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '8px',
  overflow: 'hidden',
  transition: 'all 0.4s',
  position: 'relative',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',

  '[data-theme="dark"] &': {
    background: 'var(--midway-code-bg)',
    border: '1px solid var(--midway-border)',
    boxShadow: 'none',
    animation: `${glowPulse} 6s ease-in-out infinite`,
  },

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.14), 0 0 0 1px var(--midway-primary)',

    '[data-theme="dark"] &': {
      animation: 'none',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 30px var(--midway-glow)',
      borderColor: 'var(--midway-secondary)',
    },

    '& .scan-line': {
      opacity: 1,
    }
  }
})

// 扫描线效果 - 在代码上滑过
const ScanLine = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px',
  background: 'linear-gradient(90deg, transparent 0%, var(--midway-primary) 30%, var(--midway-secondary) 70%, transparent 100%)',
  opacity: 0,
  transition: 'opacity 0.3s',
  animation: `${scanDown} 4s linear infinite`,
  zIndex: 5,
  pointerEvents: 'none',
})

const CodeHeader = styled('div', {
  background: '#EAECF0',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(0,0,0,0.1)',

  '[data-theme="dark"] &': {
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid var(--midway-border)',
  }
})

const WindowControls = styled('div', {
  display: 'flex',
  gap: '6px',
})

const FileName = styled('div', {
  fontSize: '0.75rem',
  color: '#5A6A85',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',

  '[data-theme="dark"] &': {
    color: 'var(--midway-text-sec)',
  },

  '&::before': {
    content: '""',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--midway-primary)',
    boxShadow: '0 0 6px var(--midway-primary)',
    display: 'inline-block',
    flexShrink: 0,
  }
})

const CodeStatusBar = styled('div', {
  // 亮色：用品牌主色系渐变，文字白色
  background: 'linear-gradient(90deg, #4A00E0 0%, #00D2FF 100%)',
  padding: '4px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.68rem',
  color: 'rgba(255,255,255,0.9)',
  fontWeight: 600,

  '[data-theme="dark"] &': {
    background: 'linear-gradient(90deg, var(--midway-primary) 0%, var(--midway-secondary) 100%)',
    color: '#000',
  }
})

const Dot = styled('div', {
  width: '11px',
  height: '11px',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'filter 0.2s',

  '&:hover': {
    filter: 'brightness(1.3)',
  },

  variants: {
    color: {
      red: { background: '#FF5F56' },
      yellow: { background: '#FFBD2E' },
      green: { background: '#27C93F' },
    }
  }
})

const CodeContent = styled('pre', {
  padding: '24px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.875rem',
  // 亮色：GitHub Light 语法色
  color: '#24292E',
  lineHeight: 1.65,
  margin: 0,
  overflowX: 'auto',
  position: 'relative',

  '& .kw': { color: '#D73A49' },  // 关键字 → 红
  '& .func': { color: '#6F42C1' },  // 函数名 → 紫
  '& .str': { color: '#032F62' },  // 字符串 → 深蓝
  '& .dec': { color: '#005CC5' },  // 装饰器 → 蓝
  '& .cursor': {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    background: 'var(--midway-primary)',
    verticalAlign: 'middle',
    marginLeft: '2px',
    animation: `${cursorBlink} 1s step-end infinite`,
  },

  // 暗色：原 Cyber 配色
  '[data-theme="dark"] &': {
    color: '#C9D1D9',
    '& .kw': { color: '#FF7B72' },
    '& .func': { color: '#D2A8FF' },
    '& .str': { color: '#A5D6FF' },
    '& .dec': { color: '#79C0FF' },
    '& .cursor': { background: 'var(--midway-secondary)' },
  }
})

// 行号
const LineNumbers = styled('div', {
  position: 'absolute',
  left: 0,
  top: 0,
  padding: '24px 0 24px 12px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.875rem',
  lineHeight: 1.65,
  // 亮色：浅灰行号
  color: 'rgba(0,0,0,0.2)',
  userSelect: 'none',
  textAlign: 'right',
  width: '36px',

  '[data-theme="dark"] &': {
    color: 'rgba(255,255,255,0.15)',
  }
})

const codeClass = `
<span class="dec">@Controller</span>(<span class="str">'/'</span>)
<span class="kw">export class</span> Home {
  <span class="dec">@Inject</span>()
  ctx: Context;

  <span class="dec">@Get</span>(<span class="str">'/api'</span>)
  <span class="kw">async</span> <span class="func">getData</span>() {
    <span class="kw">return</span> <span class="str">"Midway Connected"</span>;
  }
}<span class="cursor"></span>`

const codeFunction = `
<span class="kw">export default async</span> () => {
  <span class="kw">const</span> ctx = <span class="func">useContext</span>();
  <span class="kw">const</span> db = <span class="func">usePlugin</span>(TypeORM);

  <span class="kw">return</span> {
    status: <span class="str">"Active"</span>,
    data: <span class="kw">await</span> db.<span class="func">find</span>()
  };
}<span class="cursor"></span>`

export function PreviewClassSyntax() {
  const { i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale === 'en' ? 'en' : 'zh-cn';

  return (
    <Container>
      <div>
        <SectionLabel>02 // Development</SectionLabel>
        <Title>
          <Translate id="homepage.preview.class.title">Class Syntax</Translate>
        </Title>
        <Description>
          <Translate id="homepage.preview.class.description">
            Traditional OOP approach with Decorators. Perfect for large-scale enterprise applications requiring strict structure and dependency injection.
          </Translate>
        </Description>
        <EcoStrip>
          <EcoTag>Decorators</EcoTag>
          <EcoTag>IoC Container</EcoTag>
          <EcoTag>TypeORM</EcoTag>
        </EcoStrip>

        <StartButtonGroup>
          <StartButton href={`/tutorial/class/${locale}/`}>
            <Translate id="homepage.preview.startClass">Start Class Tutorial</Translate>
            <i className="iconfont icon-arrow-right" />
          </StartButton>
        </StartButtonGroup>
      </div>

      <CodeWindowWrapper>
        <CodeWindow>
          <ScanLine className="scan-line" />
          <CodeHeader>
            <WindowControls>
              <Dot color="red" />
              <Dot color="yellow" />
              <Dot color="green" />
            </WindowControls>
            <FileName>home.controller.ts</FileName>
          </CodeHeader>
          <div style={{ position: 'relative' }}>
            <LineNumbers>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <div key={n}>{n}</div>
              ))}
            </LineNumbers>
            <CodeContent
              style={{ paddingLeft: '52px' }}
              dangerouslySetInnerHTML={{ __html: codeClass }}
            />
          </div>
          <CodeStatusBar>
            <span>TypeScript</span>
            <span>Ln 9, Col 1</span>
            <span>UTF-8</span>
          </CodeStatusBar>
        </CodeWindow>
      </CodeWindowWrapper>
    </Container>
  );
}

export function PreviewFunctionSyntax() {
  const { i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale === 'en' ? 'en' : 'zh-cn';

  return (
    <Container>
      <CodeWindowWrapper css={{ '@mobile': { order: 2 } }}>
        <CodeWindow>
          <ScanLine className="scan-line" />
          <CodeHeader>
            <WindowControls>
              <Dot color="red" />
              <Dot color="yellow" />
              <Dot color="green" />
            </WindowControls>
            <FileName>function.service.ts</FileName>
          </CodeHeader>
          <div style={{ position: 'relative' }}>
            <LineNumbers>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <div key={n}>{n}</div>
              ))}
            </LineNumbers>
            <CodeContent
              style={{ paddingLeft: '52px' }}
              dangerouslySetInnerHTML={{ __html: codeFunction }}
            />
          </div>
          <CodeStatusBar>
            <span>TypeScript</span>
            <span>Ln 10, Col 1</span>
            <span>UTF-8</span>
          </CodeStatusBar>
        </CodeWindow>
      </CodeWindowWrapper>

      <MobileFirstPanel>
        <SectionLabel>03 // Agility</SectionLabel>
        <Title>
          <Translate id="homepage.preview.function.title">Function Syntax</Translate>
        </Title>
        <Description>
          <Translate id="homepage.preview.function.description">
            Modern functional approach with Hooks. Ideal for rapid development, serverless functions, and simpler mental models.
          </Translate>
        </Description>
        <EcoStrip>
          <EcoTag>Zero API</EcoTag>
          <EcoTag>React Hooks</EcoTag>
          <EcoTag>Lightweight</EcoTag>
        </EcoStrip>
        <StartButtonGroup>
          <StartButton href={`/tutorial/function/${locale}/`}>
            <Translate id="homepage.preview.startFunction">Start Functional Tutorial</Translate>
            <i className="iconfont icon-arrow-right" />
          </StartButton>
        </StartButtonGroup>
      </MobileFirstPanel>
    </Container>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PreviewDivider — Class / Function 之间的过渡微动画
// ─────────────────────────────────────────────────────────────────────

const flowRight = keyframes({
  '0%': { transform: 'translateX(-120%)', opacity: 0 },
  '20%': { opacity: 1 },
  '80%': { opacity: 1 },
  '100%': { transform: 'translateX(120%)', opacity: 0 },
});

const flowLeft = keyframes({
  '0%': { transform: 'translateX(120%)', opacity: 0 },
  '20%': { opacity: 1 },
  '80%': { opacity: 1 },
  '100%': { transform: 'translateX(-120%)', opacity: 0 },
});

const orbitBadge = keyframes({
  '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 20px var(--midway-glow)' },
  '50%': { transform: 'translate(-50%, -50%) scale(1.06)', boxShadow: '0 0 40px var(--midway-glow), 0 0 60px var(--midway-glow)' },
});

const blinkDot = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.2 },
});

const DividerWrapper = styled('div', {
  position: 'relative',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80px',

  '@mobile': { padding: '0 16px', height: '60px' },
});

/** 左/右延伸轨道线 */
const Track = styled('div', {
  position: 'absolute',
  top: '50%',
  height: '1px',
  overflow: 'hidden',

  variants: {
    side: {
      left: { left: '24px', right: 'calc(50% + 64px)', transform: 'translateY(-50%)' },
      right: { right: '24px', left: 'calc(50% + 64px)', transform: 'translateY(-50%)' },
    }
  }
});

const TrackBase = styled('div', {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, var(--midway-border) 20%, var(--midway-border) 80%, transparent)',
});

/** 在轨道上流动的光点 */
const Particle = styled('div', {
  position: 'absolute',
  top: '-2px',
  width: '40px',
  height: '5px',
  borderRadius: '3px',
  pointerEvents: 'none',

  variants: {
    dir: {
      right: {
        left: 0,
        background: 'linear-gradient(90deg, transparent, var(--midway-primary), transparent)',
        animation: `${flowRight} 2.8s ease-in-out infinite`,
      },
      left: {
        right: 0,
        background: 'linear-gradient(90deg, transparent, var(--midway-secondary), transparent)',
        animation: `${flowLeft} 2.8s ease-in-out 1.4s infinite`,
      },
    }
  }
});

/** 端点装饰小圆 */
const TrackEndDot = styled('div', {
  position: 'absolute',
  top: '50%',
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  transform: 'translateY(-50%)',
  animation: `${blinkDot} 2s ease-in-out infinite`,

  variants: {
    side: {
      left: { left: '24px', background: 'var(--midway-primary)', boxShadow: '0 0 6px var(--midway-primary)' },
      right: { right: '24px', background: 'var(--midway-secondary)', boxShadow: '0 0 6px var(--midway-secondary)', animationDelay: '1s' },
    }
  }
});

/** 中央切换徽章 */
const SwitchBadge = styled('div', {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 18px',
  background: 'var(--midway-surface)',
  border: '1px solid var(--midway-border)',
  borderRadius: '999px',
  backdropFilter: 'blur(12px)',
  animation: `${orbitBadge} 4s ease-in-out infinite`,
  whiteSpace: 'nowrap',
});

const BadgeChip = styled('span', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: '4px',

  variants: {
    kind: {
      class: {
        color: 'var(--midway-primary)',
        background: 'color-mix(in srgb, var(--midway-primary) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--midway-primary) 30%, transparent)',
      },
      fn: {
        color: 'var(--midway-secondary)',
        background: 'color-mix(in srgb, var(--midway-secondary) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--midway-secondary) 30%, transparent)',
      },
    }
  }
});

const SwapIcon = styled('div', {
  color: 'var(--midway-text-sec)',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
});

export function PreviewDivider() {
  return (
    <DividerWrapper>
      {/* 左侧轨道 */}
      <Track side="left">
        <TrackBase />
        <Particle dir="right" />
      </Track>

      {/* 右侧轨道 */}
      <Track side="right">
        <TrackBase />
        <Particle dir="left" />
      </Track>

      {/* 两端装饰点 */}
      <TrackEndDot side="left" />
      <TrackEndDot side="right" />

      {/* 中央徽章 */}
      <SwitchBadge>
        <BadgeChip kind="class">Class</BadgeChip>
        <SwapIcon>⇄</SwapIcon>
        <BadgeChip kind="fn">Function</BadgeChip>
      </SwitchBadge>
    </DividerWrapper>
  );
}
