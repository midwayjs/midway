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
    title: '项目初始化',
    description: '使用 Midway CLI 创建新的 Class 语法项目，配置 TypeScript 和依赖注入'
  },
  {
    number: 2,
    title: '控制器定义',
    description: '使用装饰器定义路由和控制器，实现 RESTful API 接口'
  },
  {
    number: 3,
    title: '服务层开发',
    description: '创建 Service 类，使用依赖注入管理业务逻辑和数据处理'
  },
  {
    number: 4,
    title: '数据模型',
    description: '集成 TypeORM，定义实体模型，实现数据库操作'
  },
  {
    number: 5,
    title: '中间件配置',
    description: '配置全局中间件，处理跨域、认证、日志等功能'
  }
];

// Class 语法教程的示例项目文件
const classTutorialFiles = {
  'package.json': {
    file: {
      contents: `{
  "name": "midway-class-tutorial",
  "version": "1.0.0",
  "description": "Midway.js Class 语法教程项目",
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
    "@midwayjs/typeorm": "^3.0.0",
    "typeorm": "^0.3.0",
    "sqlite3": "^5.0.0"
  },
  "devDependencies": {
    "@midwayjs/cli": "^3.0.0",
    "@types/node": "^18.0.0",
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
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
    }
  },
  'src/configuration.ts': {
    file: {
      contents: `import { App, Configuration } from '@midwayjs/core';
import * as web from '@midwayjs/web';
import * as typeorm from '@midwayjs/typeorm';

@Configuration({
  imports: [web, typeorm],
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
  'src/controller/home.ts': {
    file: {
      contents: `import { Controller, Get, Inject } from '@midwayjs/core';
import { HomeService } from '../service/home';

@Controller('/')
export class HomeController {
  @Inject()
  homeService: HomeService;

  @Get('/')
  async home() {
    return this.homeService.sayHello();
  }

  @Get('/hello')
  async hello() {
    return { message: 'Hello from Midway.js!' };
  }
}`
    }
  },
  'src/service/home.ts': {
    file: {
      contents: `import { Provide } from '@midwayjs/core';

@Provide()
export class HomeService {
  async sayHello() {
    return {
      message: 'Welcome to Midway.js Class Tutorial!',
      timestamp: new Date().toISOString(),
      features: [
        'IoC Container',
        'Dependency Injection',
        'Decorators',
        'TypeScript Support'
      ]
    };
  }
}`
    }
  },
  'src/entity/user.ts': {
    file: {
      contents: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`
    }
  },
  'src/middleware/cors.ts': {
    file: {
      contents: `import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/web';

@Middleware()
export class CorsMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
      }
      
      await next();
    };
  }
}`
    }
  },
  'config/config.default.ts': {
    file: {
      contents: `import { join } from 'path';

export default {
  keys: 'your-secret-key',
  
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../data.sqlite'),
        synchronize: true,
        logging: false,
        entities: [join(__dirname, '../entity/**/*.entity{.ts,.js}')],
      },
    },
  },
  
  web: {
    port: 7001,
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

export default function ClassSyntaxTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Layout title="Class 语法教程 - Midway.js" description="使用 IoC + 装饰器构建优雅的 Node.js 应用架构">
      <Container>
        <Header>
          <Title>🚧 Class 语法教程 (开发中)</Title>
          <Subtitle>
            WebContainer 功能正在开发中，即将提供使用 IoC + 装饰器构建优雅的 Node.js 应用架构的交互式学习体验
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
            files={classTutorialFiles}
            onFileChange={(path, content) => {
              console.log(`File ${path} changed:`, content);
            }}
          />
        </WebContainerWrapper>
      </Container>
    </Layout>
  );
}
