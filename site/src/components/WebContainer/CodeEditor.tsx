import React from 'react';
import { styled } from '../../styled';

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

const FilePath = styled('span', {
  fontSize: '0.8rem',
  color: 'var(--ifm-color-emphasis-600)',
  fontFamily: 'monospace',
  background: 'var(--ifm-color-emphasis-200)',
  padding: '4px 8px',
  borderRadius: '4px',
});

const EditorContainer = styled('div', {
  flex: 1,
  position: 'relative',
});

const TextArea = styled('textarea', {
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  resize: 'none',
  padding: '16px',
  fontSize: '14px',
  lineHeight: '1.5',
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  background: 'var(--ifm-color-background)',
  color: 'var(--ifm-color-emphasis-900)',
  
  '&::placeholder': {
    color: 'var(--ifm-color-emphasis-400)',
  },
});

const NoFileSelected = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--ifm-color-emphasis-500)',
  fontSize: '1rem',
  textAlign: 'center',
  padding: '20px',
});

interface CodeEditorProps {
  filePath: string;
  content: string;
  onChange: (content: string) => void;
}

export function CodeEditor({ filePath, content, onChange }: CodeEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  if (!filePath) {
    return (
      <Container>
        <Header>
          <Title>📝 代码编辑器</Title>
        </Header>
        <NoFileSelected>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👆</div>
            <div>请从左侧文件树中选择一个文件进行编辑</div>
          </div>
        </NoFileSelected>
      </Container>
    );
  }

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <Container>
      <Header>
        <Title>📝 {fileName}</Title>
        <FilePath>{filePath}</FilePath>
      </Header>
      
      <EditorContainer>
        <TextArea
          value={content}
          onChange={handleChange}
          placeholder="开始编写代码..."
          spellCheck={false}
        />
      </EditorContainer>
    </Container>
  );
}
