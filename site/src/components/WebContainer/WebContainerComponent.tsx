import React, { useState } from 'react';
import { styled } from '../../styled';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { Terminal } from './Terminal';
import { Preview } from './Preview';

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '250px 1fr 1fr',
  gridTemplateRows: '1fr 300px',
  gap: '16px',
  height: '100%',
  minHeight: '600px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto auto auto auto',
    gap: '12px',
  }
});

const FileTreePanel = styled('div', {
  background: 'var(--ifm-color-emphasis-50)',
  borderRadius: '12px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  overflow: 'hidden',
  
  '@mobile': {
    order: 1,
  }
});

const EditorPanel = styled('div', {
  background: 'var(--ifm-color-background)',
  borderRadius: '12px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  overflow: 'hidden',
  
  '@mobile': {
    order: 2,
  }
});

const PreviewPanel = styled('div', {
  background: 'var(--ifm-color-background)',
  borderRadius: '12px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  overflow: 'hidden',
  
  '@mobile': {
    order: 3,
  }
});

const TerminalPanel = styled('div', {
  background: 'var(--ifm-color-emphasis-50)',
  borderRadius: '12px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  overflow: 'hidden',
  gridColumn: '1 / -1',
  
  '@mobile': {
    order: 4,
  }
});

interface WebContainerProps {
  files: Record<string, { file: { contents: string } }>;
  onFileChange?: (path: string, content: string) => void;
}

export function WebContainerComponent({ files, onFileChange }: WebContainerProps) {
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContents, setFileContents] = useState(files);

  const handleFileSelect = (path: string) => {
    setCurrentFile(path);
  };

  const handleFileContentChange = async (path: string, content: string) => {
    setFileContents(prev => ({
      ...prev,
      [path]: { file: { contents: content } }
    }));
    onFileChange?.(path, content);
  };

  return (
    <Container>
      <FileTreePanel>
        <FileTree 
          files={fileContents} 
          onFileSelect={handleFileSelect}
          currentFile={currentFile}
        />
      </FileTreePanel>
      
      <EditorPanel>
        <CodeEditor
          filePath={currentFile}
          content={fileContents[currentFile]?.file?.contents || ''}
          onChange={(content) => handleFileContentChange(currentFile, content)}
        />
      </EditorPanel>
      
      <PreviewPanel>
        <Preview webcontainerInstance={null} />
      </PreviewPanel>
      
      <TerminalPanel>
        <Terminal webcontainerInstance={null} />
      </TerminalPanel>
    </Container>
  );
}
