import React from 'react'
import { styled } from '../styled'
import Translate from '@docusaurus/Translate';

type FeatureProps = {
  icon: string
  title: string
  description: string
  isMiddle?: boolean
}

const Container = styled('div', {
  backgroundColor: 'var(--ifm-color-background-secondary)',
  padding: '72px 0',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  '@mobile': {
    flexDirection: 'column',
    padding: '20px 0 36px 0',
  }
})

const FeatureContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  variants: {
    isMiddle: {
      true: {
        marginLeft: 120,
        marginRight: 120,
        '@mobile': {
          marginLeft: 24,
          marginRight: 24,
        }
      }
    }
  },
  '@mobile': {
    marginRight: 0
  },
})

const Icon = styled('i', {
  color: 'var(--ifm-color-icon)',
  fontSize: 64,
  '@mobile': {
    fontSize: 52,
  }
})

const Title = styled('span', {
  fontFamily: 'DINAlternate-Bold',
  fontSize: 28,
  color: 'var(--ifm-color-background-title)',
  marginTop: 36,
  marginBottom: 24,
  '@mobile': {
    marginTop: 18,
    marginBottom: 12,
    fontSize: 24
  }
})

const Description = styled('span', {
  fontFamily: 'PingFangSC-Regular',
  fontSize: 24,
  color: 'var(--ifm-color-text)',
  width: 315,
  '@mobile': {
    fontSize: 20
  }
})

function Feature(props: FeatureProps) {
  return (
    <FeatureContainer isMiddle={props.isMiddle}>
      <Icon className={`iconfont ${props.icon}`} />
      <Title>{props.title}</Title>
      <Description><Translate id={`homepage.feature.desc.${props.title}`}>{props.description}</Translate></Description>
    </FeatureContainer>
  )
}

const featurs = [
  {
    icon: 'icon-huojiancopy',
    title: 'Reliable & Fast',
    description: `Class + IoC = 更优雅的架构\nFunction + Hooks = 更高的研发效率`,
  },
  {
    icon: 'icon-nintendogamecube',
    title: 'API & Fullstack',
    description: '不仅支持开发 API 服务，也提供业界首创的一体化全栈开发模式',
    isMiddle: true
  },
  {
    icon: 'icon-MPIS-Upgrade',
    title: 'Progressive',
    description: '渐进式设计，提供从基础到入门再到企业级的升级方案，解决应用维护与拓展性难题',
  },
] as FeatureProps[]

export function CoreFeatures() {
  return (
    <Container>
      {featurs.map((feature) => <Feature  key={feature.title} {...feature} />)}
    </Container>
  )
}
