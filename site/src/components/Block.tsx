import React from 'react'
import { styled } from '../styled'
import { VAR } from '../var'

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 40,
  paddingBottom: 64,
  variants: {
    background: {
      light: {
        backgroundColor: VAR.background
      },
      dark: {
        backgroundColor: VAR.backgroundSecondary
      }
    }
  },
  '@mobile': {
    paddingTop: 20,
    paddingBottom: 36,
  }
})

const Title = styled('span', {
  fontFamily: 'DINAlternate-Bold',
  fontSize: 36,
  color: VAR.title,
  '@mobile': {
    fontSize: 28,
  }
})

const SubTitle = styled('span', {
  fontFamily: 'Inter-Regular_SemiBold',
  fontSize: 24,
  color: VAR.text,
  textAlign: 'center',
  marginBottom: 64,
  '@mobile': {
    fontSize: 18,
    marginBottom: 48,
  }
})

type BlockProps = {
  title: string
  subtitle: string
  children: any
  background: 'light' | 'dark'
}

export function Block(props: BlockProps) {
  return (
    <Container background={props.background}>
      <Title>{props.title}</Title>
      <SubTitle>{props.subtitle}</SubTitle>
      {props.children}
    </Container>
  )
}
