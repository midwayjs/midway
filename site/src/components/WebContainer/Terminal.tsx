import React, { useEffect, useRef, useState } from 'react';
import { styled } from '../../styled';
import { WebContainer } from '@webcontainer/api';

const Container = styled('div', {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled('div', {
  padding: '16px',
  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  background: 'var(--ifm-color-emphasis-100)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Title = styled('h3', {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--ifm-color-emphasis-900)',
});

const StatusIndicator = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8rem',
  
  variants: {
    status: {
      running: {
        color: 'var(--ifm-color-success)',
      },
      stopped: {
        color: 'var(--ifm-color-error)',
      },
      idle: {
        color: 'var(--ifm-color-emphasis-500)',
      },
    },
  },
});

const StatusDot = styled('div', {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginRight: '8px',
  
  variants: {
    status: {
      running: {
        background: 'var(--ifm-color-success)',
        animation: 'pulse 2s infinite',
      },
      stopped: {
        background: 'var(--ifm-color-error)',
      },
      idle: {
        background: 'var(--ifm-color-emphasis-500)',
      },
    },
  },
  
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
});

const TerminalOutput = styled('div', {
  flex: 1,
  background: 'var(--ifm-color-emphasis-50)',
  padding: '16px',
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  fontSize: '13px',
  lineHeight: '1.4',
  color: 'var(--ifm-color-emphasis-900)',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

const CommandInput = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderTop: '1px solid var(--ifm-color-emphasis-200)',
  background: 'var(--ifm-color-emphasis-100)',
});

const Prompt = styled('span', {
  color: 'var(--ifm-color-primary)',
  marginRight: '8px',
  fontWeight: 'bold',
});

const Input = styled('input', {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'var(--ifm-color-emphasis-900)',
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  fontSize: '13px',
  
  '&::placeholder': {
    color: 'var(--ifm-color-emphasis-400)',
  },
});

const NoWebContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--ifm-color-emphasis-500)',
  fontSize: '1rem',
  textAlign: 'center',
  padding: '20px',
});

interface TerminalProps {
  webcontainerInstance: WebContainer | null;
}

export function Terminal({ webcontainerInstance }: TerminalProps) {
  const [output, setOutput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
  const [command, setCommand] = useState<string>('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (webcontainerInstance) {
      setStatus('running');
      
      // 监听进程输出
      webcontainerInstance.on('server-ready', (port, url) => {
        setOutput(prev => prev + `\n🚀 开发服务器已启动: http://localhost:${port}\n`);
        scrollToBottom();
      });
      
      // 监听错误
      webcontainerInstance.on('error', (error) => {
        setOutput(prev => prev + `\n❌ 错误: ${error.message}\n`);
        setStatus('stopped');
        scrollToBottom();
      });
    }
  }, [webcontainerInstance]);

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  const handleCommandSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim() && webcontainerInstance) {
      const cmd = command.trim();
      setOutput(prev => prev + `\n$ ${cmd}\n`);
      setCommand('');
      
      try {
        const process = await webcontainerInstance.spawn(cmd.split(' ')[0], cmd.split(' ').slice(1));
        
        process.output.pipeTo(new WritableStream({
          write(chunk) {
            setOutput(prev => prev + chunk);
            scrollToBottom();
          }
        }));
        
        process.exit.then((exitCode) => {
          setOutput(prev => prev + `\n进程退出，代码: ${exitCode}\n`);
          scrollToBottom();
        });
        
      } catch (error) {
        setOutput(prev => prev + `\n❌ 命令执行失败: ${error}\n`);
        scrollToBottom();
      }
    }
  };

  if (!webcontainerInstance) {
    return (
      <Container>
        <Header>
          <Title>💻 终端</Title>
        </Header>
        <NoWebContainer>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🚧</div>
            <div>WebContainer 功能开发中</div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--ifm-color-emphasis-500)' }}>
              当前仅支持文件浏览和编辑
            </div>
          </div>
        </NoWebContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>💻 终端</Title>
        <StatusIndicator status={status}>
          <StatusDot status={status} />
          {status === 'running' && '运行中'}
          {status === 'stopped' && '已停止'}
          {status === 'idle' && '空闲'}
        </StatusIndicator>
      </Header>
      
      <TerminalOutput ref={outputRef}>
        {output || '🚀 WebContainer 终端已就绪\n输入命令开始操作...\n'}
      </TerminalOutput>
      
      <CommandInput>
        <Prompt>$</Prompt>
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommandSubmit}
          placeholder="输入命令，按 Enter 执行..."
        />
      </CommandInput>
    </Container>
  );
}
