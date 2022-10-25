import React from 'react';
import { useWindupString, CharWrapper } from 'windups';
import { styled } from '../styled';
import { keyframes } from '@stitches/react';
import { VAR } from '../var';

const Container = styled('div', {
  paddingTop: 100,
  paddingBottom: 205,
  paddingLeft: 125,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundRepeat: 'no-repeat',
  // backgroundPosition: '100% 50%'
  backgroundSize: 'cover',
  backgroundImage: 'url(https://img.alicdn.com/imgextra/i3/O1CN01U1n8RC1evopP9MIKi_!!6000000003934-2-tps-1440-707.png)',
  '@mobile': {
    alignItems: 'center',
    paddingLeft: 0,
    paddingTop: 50,
    paddingBottom: 88,
    backgroundImage: 'none',
  },
  ':root[data-theme="dark"] &': {
    backgroundSize: 'cover',
    backgroundImage:
      'url(https://img.alicdn.com/imgextra/i4/O1CN012rXL8D1s2lqX6AqdY_!!6000000005709-2-tps-1440-650.png)',
  },
});

const Title = styled('span', {
  fontFamily: 'DINAlternate-Bold',
  fontSize: 50,
  color: VAR.title,
});

const SubTitle = styled('span', {
  fontFamily: 'DINAlternate-Bold',
  fontSize: 50,
  color: VAR.title,
  '@mobile': {
    fontSize: 20,
  },
});

const opacityKeyframe = keyframes({
  from: {
    opacity: 0.3,
  },
  to: {
    opacity: 1,
  },
});

const Description = styled('span', {
  paddingBottom: 2,
  borderBottom: `4px solid ${VAR.text}`,
  '@mobile': {
    borderBottomWidth: 2,
  },
  animation: `${opacityKeyframe} 0.3s ease`,
  animationIterationCount: 1,
  transition: '0.3s all',
});

const ButtonGroup = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  marginTop: 88,
  '@mobile': {
    flexDirection: 'column',
  },
});

const Button = styled('a', {
  width: 252,
  height: 58,
  borderRadius: 4,
  fontFamily: 'DINAlternate-Bold',
  fontSize: '2rem',
  color: '#ffffff',
  display: 'flex',
  flexDirect: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  variants: {
    type: {
      main: {
        backgroundColor: '#007aff',
        marginRight: 36,
        '@mobile': {
          marginRight: 0,
          marginBottom: 24,
        },
      },
      secondary: {
        backgroundColor: '#3a4855',
      },
    },
  },
  '@mobile': {
    fontSize: 20,
    height: 50,
  },
  '&:hover': {
    color: '#ffffff',
    textDecoration: 'none',
  },
});

const Icon = styled('i', {
  fontSize: '2rem',
  marginRight: 8,
  display: 'flex',
});

const StarContainer = styled('div', {
  marginTop: 36,
});

const targets = [
  'Web',
  'Fullstack',
  'Achitecture',
  'API',
  'Production',
  'Microservice',
  'Serverless',
  'Speed',
  'Efficiency',
  'Developer',
  'Experience',
];

export function Splash() {
  const [index, setIndex] = React.useState(0);

  const [text] = useWindupString(targets[index], {
    onFinished() {
      const nextIndex = index === targets.length - 1 ? 0 : index + 1;
      setTimeout(() => {
        setIndex(nextIndex);
      }, 3000);
    },
    pace: () => 100,
  });

  return (
    <Container>
      <Title>Midway</Title>
      <SubTitle>
        Node.js Framework For "
        {text.split('').map((char, index) => (
          <Description key={char + index}>{char}</Description>
        ))}
        "
      </SubTitle>
      <ButtonGroup>
        <Button type="main" href="/docs/intro">
          Documention
        </Button>
        <Button type="secondary" href="https://github.com/midwayjs/midway" target="_blank">
          <Icon className="iconfont icon-github-fill" />
          GitHub
        </Button>
      </ButtonGroup>
      <StarContainer>
        <iframe
          src="https://ghbtns.com/github-btn.html?user=midwayjs&repo=midway&type=star&count=true&size=large"
          frameBorder="0"
          scrolling="0"
          width="170"
          height="30"
          title="GitHub"
        />
      </StarContainer>
    </Container>
  );
}
