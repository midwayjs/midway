import React, { useState } from 'react';
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
});

const Title = styled('h3', {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--ifm-color-emphasis-900)',
});

const FileList = styled('div', {
  flex: 1,
  overflow: 'auto',
  padding: '8px',
});

const FileItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  color: 'var(--ifm-color-emphasis-700)',
  
  '&:hover': {
    background: 'var(--ifm-color-emphasis-100)',
    color: 'var(--ifm-color-emphasis-900)',
  },
  
  variants: {
    selected: {
      true: {
        background: 'var(--ifm-color-primary)',
        color: 'var(--ifm-color-primary-contrast-foreground)',
        
        '&:hover': {
          background: 'var(--ifm-color-primary-darker)',
        },
      },
    },
  },
});

const FileIcon = styled('span', {
  marginRight: '8px',
  fontSize: '1rem',
});

const FileName = styled('span', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const FolderItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  color: 'var(--ifm-color-emphasis-700)',
  
  '&:hover': {
    background: 'var(--ifm-color-emphasis-100)',
    color: 'var(--ifm-color-emphasis-900)',
  },
});

const FolderIcon = styled('span', {
  marginRight: '8px',
  fontSize: '1rem',
  transition: 'transform 0.2s ease',
  
  variants: {
    expanded: {
      true: {
        transform: 'rotate(90deg)',
      },
    },
  },
});

const FolderName = styled('span', {
  flex: 1,
  fontWeight: 500,
});

const FolderContents = styled('div', {
  marginLeft: '16px',
  borderLeft: '1px solid var(--ifm-color-emphasis-200)',
});

interface FileTreeProps {
  files: Record<string, { file: { contents: string } }>;
  onFileSelect: (path: string) => void;
  currentFile: string;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
}

function buildFileTree(files: Record<string, { file: { contents: string } }>): TreeNode[] {
  const tree: TreeNode[] = [];
  const filePaths = Object.keys(files);
  
  filePaths.forEach(filePath => {
    const parts = filePath.split('/');
    let currentLevel = tree;
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');
      
      let node = currentLevel.find(n => n.name === part);
      
      if (!node) {
        node = {
          name: part,
          type: isLast ? 'file' : 'folder',
          path: currentPath,
          children: isLast ? undefined : [],
        };
        currentLevel.push(node);
      }
      
      if (node.children && !isLast) {
        currentLevel = node.children;
      }
    });
  });
  
  return tree;
}

function FileTreeItem({ 
  node, 
  onFileSelect, 
  currentFile, 
  level = 0 
}: { 
  node: TreeNode; 
  onFileSelect: (path: string) => void; 
  currentFile: string;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 默认展开前两级
  
  if (node.type === 'file') {
    return (
      <FileItem
        selected={currentFile === node.path}
        onClick={() => onFileSelect(node.path)}
      >
        <FileIcon>
          {getFileIcon(node.name)}
        </FileIcon>
        <FileName>{node.name}</FileName>
      </FileItem>
    );
  }
  
  return (
    <div>
      <FolderItem onClick={() => setIsExpanded(!isExpanded)}>
        <FolderIcon expanded={isExpanded}>
          ▶
        </FolderIcon>
        <FolderName>{node.name}</FolderName>
      </FolderItem>
      
      {isExpanded && node.children && (
        <FolderContents>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              currentFile={currentFile}
              level={level + 1}
            />
          ))}
        </FolderContents>
      )}
    </div>
  );
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '📘';
    case 'js':
    case 'jsx':
      return '📗';
    case 'json':
      return '📄';
    case 'md':
      return '📝';
    case 'yml':
    case 'yaml':
      return '⚙️';
    case 'html':
      return '🌐';
    case 'css':
      return '🎨';
    case 'scss':
    case 'less':
      return '🎨';
    default:
      return '📄';
  }
}

export function FileTree({ files, onFileSelect, currentFile }: FileTreeProps) {
  const fileTree = buildFileTree(files);
  
  return (
    <Container>
      <Header>
        <Title>📁 项目文件</Title>
      </Header>
      
      <FileList>
        {fileTree.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            onFileSelect={onFileSelect}
            currentFile={currentFile}
          />
        ))}
      </FileList>
    </Container>
  );
}
