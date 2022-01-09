import { Block } from './Block'
import React from 'react'
import { VAR } from '../var'
import { styled } from '../styled'

const ComponentContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
})

const IconContainer = styled('div', {
  width: 64,
  height: 64,
  borderRadius: 8,
  backgroundColor: VAR.componentBackground,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
})

const Icon = styled('i', {
  fontSize: 32,
  color: VAR.title,
})

const TextContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  justifyContent: 'space-between',
})

const Title = styled('a', {
  fontFamily: 'JetBrainsMono-Regular',
  fontSize: 22,
  textDecoration: 'underline',
  color: VAR.title,
  '&:hover': {
    color: VAR.title,
  },
  lineHeight: 1,
  cursor: 'pointer',
})

const Description = styled('span', {
  fontFamily: 'Inter-Medium',
  fontSize: 18,
  color: VAR.text,
})

type ComponentProps = {
  icon: string
  title: string
  link: string
  description: string
}

function Component(props: ComponentProps) {
  return (
    <ComponentContainer>
      <IconContainer>
        <Icon className={`${props.icon} iconfont`} />
      </IconContainer>
      <TextContainer>
        <Title href={props.link}>{props.title}</Title>
        <Description>{props.description}</Description>
      </TextContainer>
    </ComponentContainer>
  )
}

const components = [
  {
    title: 'ORM',
    link: '/docs/orm',
    description: 'TypeORM-based database SDK',
    icon: 'icon-database_plus_fill',
  },
  {
    title: 'Redis',
    link: '/docs/redis',
    description: 'In-memory database for midway.js',
    icon: 'icon-redis',
  },
  {
    title: 'Swagger',
    link: '/docs/swagger',
    description: 'Generate API documentation',
    icon: 'icon-swagger',
  },
  {
    title: 'Mongodb',
    link: '/docs/mongo',
    description: 'NoSQL Database',
    icon: 'icon-MongoDB',
  },
  {
    title: 'Cache',
    link: '/docs/cache',
    description: 'Memory cache support',
    icon: 'icon-memcacheyunshujukuMemcac',
  },
  {
    title: 'OSS',
    link: '/docs/oss',
    description: 'Aliyun OSS Support',
    icon: 'icon-ossduixiangcunchuOSS',
  },
] as ComponentProps[]

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: 200,
  rowGap: 64,
  '@mobile': {
    gridTemplateColumns: '1fr',
    rowGap: 32,
    paddingLeft: 16
  },
})

export function EssentialsComponents() {
  return (
    <Block title="Essentials Components" subtitle="All the features you need for development" background="light">
      <Grid>
        {components.map((component, index) => (
          <Component key={index} {...component} />
        ))}
      </Grid>
    </Block>
  )
}
