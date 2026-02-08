import React from 'react';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import Translate from '@docusaurus/Translate';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '60px',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto 120px',
  padding: '0 24px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '40px',
    padding: '0 16px',
    marginBottom: '80px',
  }
});

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.9rem',
  color: 'var(--midway-secondary)',
  marginBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

const Title = styled('h2', {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 20px 0',
  display: 'inline-block',
  position: 'relative',
  
  '&::after': {
    content: '""',
    display: 'block',
    width: '40%',
    height: '4px',
    background: 'var(--midway-secondary)',
    marginTop: '8px',
    borderRadius: '2px',
  }
})

const Description = styled('p', {
  fontSize: '1.1rem',
  color: 'var(--midway-text-sec)',
  marginBottom: '32px',
  lineHeight: 1.6,
})

const EcoStrip = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  marginTop: '40px',
})

const EcoTag = styled('div', {
  padding: '8px 16px',
  border: '1px solid var(--midway-border)',
  color: 'var(--midway-text-sec)',
  fontSize: '0.9rem',
  background: 'var(--midway-surface)',
  cursor: 'default',
  transition: 'all 0.3s',
  borderRadius: '4px',
  
  '&:hover': {
    borderColor: 'var(--midway-primary)',
    color: 'var(--midway-primary)',
    transform: 'scale(1.05)',
  }
})

const StartButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  marginTop: '28px',
  backgroundColor: 'var(--midway-primary)',
  color: '#ffffff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'all 0.25s ease',

  '&:hover': {
    backgroundColor: 'var(--midway-secondary)',
    color: '#ffffff',
    textDecoration: 'none',
    transform: 'translateY(-1px)',
  },
})

// Code Window Components
const CodeWindow = styled('div', {
  background: 'var(--midway-code-bg)',
  border: '1px solid var(--midway-border)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  transition: 'all 0.3s',
  position: 'relative',
  
  '&:hover': {
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    borderColor: 'var(--midway-secondary)',
  }
})

const CodeHeader = styled('div', {
  background: 'rgba(255,255,255,0.05)',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--midway-border)',
})

const WindowControls = styled('div', {
  display: 'flex',
  gap: '8px',
})

const FileName = styled('div', {
  fontSize: '0.8rem',
  color: 'var(--midway-text-sec)',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
})

const CodeStatusBar = styled('div', {
  background: 'rgba(255,255,255,0.02)',
  padding: '4px 16px',
  borderTop: '1px solid var(--midway-border)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '16px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.7rem',
  color: 'var(--midway-text-sec)',
})

const Dot = styled('div', {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  
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
  fontSize: '0.9rem',
  color: '#C9D1D9',
  lineHeight: 1.6,
  margin: 0,
  overflowX: 'auto',
  
  '& .kw': { color: '#FF7B72' },
  '& .func': { color: '#D2A8FF' },
  '& .str': { color: '#A5D6FF' },
  '& .dec': { color: '#79C0FF' },
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
}`

const codeFunction = `
<span class="kw">export default async</span> () => {
  <span class="kw">const</span> ctx = <span class="func">useContext</span>();
  <span class="kw">const</span> db = <span class="func">usePlugin</span>(TypeORM);

  <span class="kw">return</span> {
    status: <span class="str">"Active"</span>,
    data: <span class="kw">await</span> db.<span class="func">find</span>()
  };
}`

export function PreviewClassSyntax() {
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
      </div>
      
      <CodeWindow>
        <CodeHeader>
          <WindowControls>
            <Dot color="red" />
            <Dot color="yellow" />
            <Dot color="green" />
          </WindowControls>
          <FileName>home.controller.ts</FileName>
        </CodeHeader>
        <CodeContent dangerouslySetInnerHTML={{ __html: codeClass }} />
        <CodeStatusBar>
          <span>Ln 9, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript</span>
        </CodeStatusBar>
      </CodeWindow>
    </Container>
  );
}

export function PreviewFunctionSyntax() {
  return (
    <Container>
      <CodeWindow css={{ '@mobile': { order: 2 } }}>
        <CodeHeader>
          <WindowControls>
            <Dot color="red" />
            <Dot color="yellow" />
            <Dot color="green" />
          </WindowControls>
          <FileName>function.service.ts</FileName>
        </CodeHeader>
        <CodeContent dangerouslySetInnerHTML={{ __html: codeFunction }} />
        <CodeStatusBar>
          <span>Ln 10, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript</span>
        </CodeStatusBar>
      </CodeWindow>
      
      <div css={{ '@mobile': { order: 1 } }}>
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
        
        <StartButton href="/tutorial/class/zh-cn/">
          <Translate id="homepage.preview.start">Start Interactive Tutorial</Translate>
          <i className="iconfont icon-arrow-right" />
        </StartButton>
      </div>
    </Container>
  );
}
