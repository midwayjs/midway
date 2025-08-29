import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { styled } from '../../styled';
import { keyframes } from '@stitches/react';
import { WebContainerComponent } from '../../components/WebContainer';

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const Container = styled('div', {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '40px 24px',
  
  '@mobile': {
    padding: '24px 16px',
  }
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '60px',
  animation: `${fadeInUp} 0.8s ease-out`,
  
  '@mobile': {
    marginBottom: '40px',
  }
});

const Title = styled('h1', {
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  fontWeight: 800,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 24px 0',
  lineHeight: 1.2,
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const Subtitle = styled('p', {
  fontSize: '1.25rem',
  color: 'var(--ifm-color-emphasis-600)',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: 1.6,
  
  '@mobile': {
    fontSize: '1.1rem',
  }
});

const TutorialContent = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
  alignItems: 'start',
  marginBottom: '60px',
  
  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '24px',
    marginBottom: '40px',
  }
});

const StepsContainer = styled('div', {
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
});

const Step = styled('div', {
  background: 'var(--ifm-color-background)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
  border: '1px solid var(--ifm-color-emphasis-200)',
  boxShadow: '0 4px 16px var(--ifm-color-emphasis-100)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px var(--ifm-color-emphasis-200)',
  }
});

const StepNumber = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-darker) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  fontWeight: 'bold',
  marginBottom: '16px',
});

const StepTitle = styled('h3', {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 12px 0',
});

const StepDescription = styled('p', {
  fontSize: '1rem',
  color: 'var(--ifm-color-emphasis-700)',
  lineHeight: 1.6,
  margin: 0,
});

const WebContainerSection = styled('div', {
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
  background: 'var(--ifm-color-emphasis-50)',
  borderRadius: '20px',
  padding: '32px',
  border: '1px solid var(--ifm-color-emphasis-200)',
});

const WebContainerTitle = styled('h2', {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ifm-color-emphasis-900)',
  margin: '0 0 20px 0',
  textAlign: 'center',
});

const WebContainerDescription = styled('p', {
  fontSize: '1.1rem',
  color: 'var(--ifm-color-emphasis-600)',
  textAlign: 'center',
  margin: '0 0 32px 0',
  lineHeight: 1.6,
});

const WebContainerWrapper = styled('div', {
  height: '700px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid var(--ifm-color-emphasis-200)',
  background: 'var(--ifm-color-background)',
});

const steps = [
  {
    number: 1,
    title: '全栈项目创建',
    description: '使用 Midway CLI 创建前后端一体化的全栈项目，支持 React + Node.js 开发'
  },
  {
    number: 2,
    title: '函数式 API',
    description: '使用函数定义 API 接口，无需类装饰器，代码更简洁直观'
  },
  {
    number: 3,
    title: 'Hooks 开发',
    description: '在后端使用类似 React Hooks 的模式，管理状态和副作用'
  },
  {
    number: 4,
    title: '零 API 调用',
    description: '直接从后端导入函数，无需手动发起 HTTP 请求，开发体验更佳'
  },
  {
    number: 5,
    title: '部署和扩展',
    description: '支持 Serverless 部署，轻松扩展到云环境'
  }
];

// Function 语法教程的示例项目文件
const functionTutorialFiles = {
  'package.json': {
    file: {
      contents: `{
  "name": "midway-function-tutorial",
  "version": "1.0.0",
  "description": "Midway.js Function 语法教程项目",
  "main": "bootstrap.js",
  "scripts": {
    "dev": "midway-bin dev --ts",
    "build": "midway-bin build --ts",
    "start": "midway-bin start --ts"
  },
  "dependencies": {
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "@midwayjs/web": "^3.0.0",
    "@midwayjs/hooks": "^3.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@midwayjs/cli": "^3.0.0",
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0"
  }
}`
    }
  },
  'tsconfig.json': {
    file: {
      contents: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
    }
  },
  'src/App.tsx': {
    file: {
      contents: `import React, { useState, useEffect } from 'react';
import { getUserInfo, createUser } from './apis/lambda';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const newUser = await createUser({
        name: 'New User',
        email: 'user@example.com'
      });
      setUser(newUser);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Midway.js Function Tutorial</h1>
      
      {user ? (
        <div>
          <h2>User Info</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <button onClick={handleCreateUser}>Create New User</button>
        </div>
      ) : (
        <div>
          <p>No user found</p>
          <button onClick={handleCreateUser}>Create User</button>
        </div>
      )}
    </div>
  );
}

export default App;`
    }
  },
  'src/apis/lambda/index.ts': {
    file: {
      contents: `import { useInject } from '@midwayjs/hooks';
import { UserService } from '../../services/user';

export const getUserInfo = async () => {
  const userService = useInject(UserService);
  return await userService.getUser();
};

export const createUser = async (userData: { name: string; email: string }) => {
  const userService = useInject(UserService);
  return await userService.createUser(userData);
};

export const updateUser = async (id: number, userData: Partial<{ name: string; email: string }>) => {
  const userService = useInject(UserService);
  return await userService.updateUser(id, userData);
};

export const deleteUser = async (id: number) => {
  const userService = useInject(UserService);
  return await userService.deleteUser(id);
};`
    }
  },
  'src/services/user.ts': {
    file: {
      contents: `import { Provide, Inject } from '@midwayjs/core';

@Provide()
export class UserService {
  private users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  async getUser() {
    return this.users[0] || null;
  }

  async createUser(userData: { name: string; email: string }) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<{ name: string; email: string }>) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  async deleteUser(id: number) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return deletedUser;
  }
}`
    }
  },
  'src/configuration.ts': {
    file: {
      contents: `import { App, Configuration } from '@midwayjs/core';
import * as web from '@midwayjs/web';
import * as hooks from '@midwayjs/hooks';

@Configuration({
  imports: [web, hooks],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  async onReady() {
    // 应用启动完成后的逻辑
  }
}

export class ContainerConfiguration {
  async onReady() {
    // 容器启动完成后的逻辑
  }
}`
    }
  },
  'config/config.default.ts': {
    file: {
      contents: `export default {
  keys: 'your-secret-key',
  
  web: {
    port: 7002,
  },
  
  hooks: {
    // Hooks 配置
  },
};`
    }
  },
  'bootstrap.js': {
    file: {
      contents: `const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();`
    }
  }
};

export default function FunctionSyntaxTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Layout title="Function 语法教程 - Midway.js" description="使用函数 + Hooks 进行快速全栈应用开发">
      <Container>
        <Header>
          <Title>🚧 Function 语法教程 (开发中)</Title>
          <Subtitle>
            WebContainer 功能正在开发中，即将提供使用函数 + Hooks 进行快速全栈应用开发的交互式学习体验
          </Subtitle>
        </Header>
        
        <TutorialContent>
          <StepsContainer>
            {steps.map((step, index) => (
              <Step 
                key={step.number}
                onClick={() => setCurrentStep(index)}
                style={{ 
                  cursor: 'pointer',
                  borderColor: currentStep === index ? 'var(--ifm-color-primary)' : undefined,
                  transform: currentStep === index ? 'translateY(-4px)' : undefined,
                }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Step>
            ))}
          </StepsContainer>
          
          <div>
            <WebContainerSection>
              <WebContainerTitle>🚀 交互式开发环境</WebContainerTitle>
              <WebContainerDescription>
                在右侧的 WebContainer 环境中，你可以：
                <br />
                • 浏览项目文件结构
                <br />
                • 实时编辑代码
                <br />
                • 运行和调试应用
                <br />
                • 查看实时预览
              </WebContainerDescription>
            </WebContainerSection>
          </div>
        </TutorialContent>
        
        <WebContainerWrapper>
          <WebContainerComponent 
            files={functionTutorialFiles}
            onFileChange={(path, content) => {
              console.log(`File ${path} changed:`, content);
            }}
          />
        </WebContainerWrapper>
      </Container>
    </Layout>
  );
}
