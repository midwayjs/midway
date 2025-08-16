import React, { useEffect, useState } from 'react';
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

const PreviewControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const RefreshButton = styled('button', {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-color-emphasis-100)',
  color: 'var(--ifm-color-emphasis-700)',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    background: 'var(--ifm-color-emphasis-200)',
    borderColor: 'var(--ifm-color-emphasis-400)',
  },
});

const PreviewFrame = styled('div', {
  flex: 1,
  background: 'var(--ifm-color-emphasis-50)',
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: '8px',
  margin: '16px',
  overflow: 'hidden',
  position: 'relative',
});

const Iframe = styled('iframe', {
  width: '100%',
  height: '100%',
  border: 'none',
  background: 'white',
});

const LoadingState = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--ifm-color-emphasis-600)',
  fontSize: '1rem',
  textAlign: 'center',
  padding: '20px',
});

const ErrorState = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--ifm-color-error)',
  fontSize: '1rem',
  textAlign: 'center',
  padding: '20px',
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

interface PreviewProps {
  webcontainerInstance: WebContainer | null;
}

export function Preview({ webcontainerInstance }: PreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [port, setPort] = useState<number | null>(null);

  useEffect(() => {
    if (webcontainerInstance) {
      setIsLoading(true);
      setError(null);
      
      // 监听服务器就绪事件
      webcontainerInstance.on('server-ready', (serverPort, url) => {
        setPort(serverPort);
        setPreviewUrl(url);
        setIsLoading(false);
      });
      
      // 监听错误
      webcontainerInstance.on('error', (err) => {
        setError(err.message);
        setIsLoading(false);
      });
    }
  }, [webcontainerInstance]);

  const handleRefresh = () => {
    if (previewUrl) {
      // 强制刷新 iframe
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  if (!webcontainerInstance) {
    return (
      <Container>
        <Header>
          <Title>🌐 预览</Title>
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

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>🌐 预览</Title>
        </Header>
        <LoadingState>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🚀</div>
            <div>正在启动开发服务器...</div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--ifm-color-emphasis-500)' }}>
              这可能需要几秒钟时间
            </div>
          </div>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>🌐 预览</Title>
        </Header>
        <ErrorState>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>❌</div>
            <div>启动失败: {error}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--ifm-color-emphasis-500)' }}>
              请检查终端输出或刷新页面重试
            </div>
          </div>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🌐 预览</Title>
        <PreviewControls>
          {port && (
            <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
              端口: {port}
            </span>
          )}
          <RefreshButton onClick={handleRefresh}>
            🔄 刷新
          </RefreshButton>
        </PreviewControls>
      </Header>
      
      <PreviewFrame>
        {previewUrl ? (
          <Iframe
            src={previewUrl}
            title="应用预览"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <LoadingState>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
              <div>等待应用启动...</div>
            </div>
          </LoadingState>
        )}
      </PreviewFrame>
    </Container>
  );
}
