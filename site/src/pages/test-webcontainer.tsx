import React from 'react';
import Layout from '@theme/Layout';
import { WebContainerComponent } from '../components/WebContainer';

const testFiles = {
  'package.json': {
    file: {
      contents: `{
  "name": "test-project",
  "version": "1.0.0",
  "description": "Test project for WebContainer"
}`
    }
  },
  'src/index.ts': {
    file: {
      contents: `console.log('Hello, WebContainer!');`
    }
  },
  'README.md': {
    file: {
      contents: `# Test Project

This is a test project for WebContainer component.`
    }
  }
};

export default function TestWebContainer() {
  return (
    <Layout title="WebContainer 测试" description="测试 WebContainer 组件">
      <div style={{ padding: '20px' }}>
        <h1>WebContainer 组件测试</h1>
        <p>这个页面用于测试 WebContainer 组件是否正常工作。</p>
        
        <div style={{ height: '600px', marginTop: '20px' }}>
          <WebContainerComponent 
            files={testFiles}
            onFileChange={(path, content) => {
              console.log(`File ${path} changed:`, content);
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
