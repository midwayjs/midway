import React from 'react';
import { Block } from './Block';
import Collapse from 'rc-collapse';
import 'rc-collapse/assets/index.css';
import { VAR } from '../var';
import CodeSandbox from '@uiw/react-codesandbox';
import { collapseMotion } from './Preview/motion';
import ClassDemo from './Preview/class.json';
import FunctionDemo from './Preview/function.json';
import { styled } from '../styled';
import { useMediaQuery } from '@react-hook/media-query';

const activeVariants = {
  variants: {
    active: {
      true: {
        color: VAR.title,
        borderColor: VAR.title,
      },
      false: {
        color: VAR.text,
        borderColor: VAR.text,
      },
    },
  },
};

const IndexIndicator = styled('div', {
  width: 40,
  height: 40,
  borderRadius: 8,
  borderStyle: 'solid',
  borderWidth: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'DINAlternate-Bold',
  fontSize: '1.375rem',
  ...activeVariants,
});

const FeatureHeaderContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const FeatureHeaderTitle = styled('span', {
  fontFamily: 'Inter-Medium',
  fontSize: '1.375rem',
  marginLeft: 16,
  ...activeVariants,
});

const Descrption = styled('span', {
  fontSize: '1.25rem',
  ...activeVariants,
});

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
});

const CodeSandBoxContainer = styled('div', {
  width: 833,
  height: 509,
  marginLeft: 50,
  // '@mobile': {
  //   display: 'none',
  // },
});

type HeaderProps = {
  index?: number;
  title: string;
  active: boolean;
};

function FeatureHeader(props: HeaderProps) {
  return (
    <FeatureHeaderContainer>
      <IndexIndicator active={props.active}>{props.index + 1}</IndexIndicator>
      <FeatureHeaderTitle active={props.active}>{props.title}</FeatureHeaderTitle>
    </FeatureHeaderContainer>
  );
}

interface FeatureProps extends HeaderProps {
  description: string;
  query?: string;
}

function Features(props: { features: FeatureProps[]; onChange: (key: string) => void; activeIndex: number }) {
  return (
    <Collapse
      style={{
        backgroundColor: 'transparent',
        border: 'none',
      }}
      openMotion={collapseMotion}
      accordion={true}
      defaultActiveKey="0"
      onChange={props.onChange}
    >
      {props.features.map((feature, index) => {
        const isActive = props.activeIndex === index;
        return (
          <Collapse.Panel
            key={index}
            showArrow={false}
            header={<FeatureHeader active={isActive} title={feature.title} index={index} />}
            headerClass="rc-collapse-override"
            style={{
              width: 306,
            }}
          >
            <Descrption active={isActive}>{feature.description}</Descrption>
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
}

const ClassSyntaxFeatures = [
  {
    title: 'Router',
    description: 'Midway.js 路由功能完善，支持通过装饰器定义路由，路由前缀等',
    query: 'module=/src/controller/home.ts',
  },
  {
    title: 'Service',
    description: '使用依赖注入，提供更为优雅的架构',
    query: 'module=/src/controller/api.ts&initialpath=/api/get_user?uid=123456',
  },
  {
    title: 'Model',
    description: '基于 TypeORM 轻松使用数据库',
    query: 'module=/src/entity/photo.ts&initialpath=/api/get_photo',
  },
  {
    title: 'Component',
    description: '使用 Midway 组件快速开发',
    query: 'module=/src/configuration.ts',
  },
] as FeatureProps[];

type PreviewContainerProps = {
  title: string;
  subtitle: string;
  background: 'light' | 'dark';
  features: FeatureProps[];
  demo: {
    files: any;
  };
};

function PreviewContainer(props: PreviewContainerProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [index, setIndex] = React.useState(0);

  const handleChange = (key: string) => {
    setIndex(Number(key));
    props.demo.files = { ...props.demo.files };
  };

  return (
    <Block title={props.title} subtitle={props.subtitle} background={props.background}>
      <Container>
        <Features onChange={handleChange} activeIndex={index} features={props.features} />
        {!isMobile && (
          <CodeSandBoxContainer>
            <CodeSandbox
              embed
              files={props.demo.files}
              query={`${props.features[index].query}&codemirror=1&hidenavigation=1&fontsize=14`}
            />
          </CodeSandBoxContainer>
        )}
      </Container>
    </Block>
  );
}

export function PreviewClassSyntax() {
  return (
    <PreviewContainer
      title="Preview - Class Syntax"
      subtitle="Use IoC + Decorator to provide better architecture"
      background="light"
      demo={ClassDemo}
      features={ClassSyntaxFeatures}
    />
  );
}

const FunctionSyntaxFeatures = [
  {
    title: 'FullStack',
    description: '前后端一体化项目开发，效率更高',
    query: 'module=/src/App.tsx',
  },
  {
    title: 'Function as API',
    description: '使用函数开发接口，更简洁 & 更快速',
    query: 'module=/src/apis/lambda/index.ts&initialpath=/api',
  },
  {
    title: 'Hooks',
    description: '使用 “React Hooks” 开发后端',
    query: 'highlights=4,5,6&module=/src/apis/lambda/index.ts&initialpath=/api',
  },
  {
    title: 'Zero API',
    description: '“零” API 调用，从后端导入函数而不是手动发起 Ajax 请求',
    query: 'highlights=3,9,10,11,12,13,14,15,16,17&module=/src/App.tsx&initialpath=/',
  },
] as FeatureProps[];

export function PreviewFunctionSyntax() {
  return (
    <PreviewContainer
      title="Preview - Function Syntax"
      subtitle="Using Function + Hooks for rapid application development"
      background="dark"
      demo={FunctionDemo}
      features={FunctionSyntaxFeatures}
    />
  );
}
