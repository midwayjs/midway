import { Block } from './Block'
import React from 'react'
import { VAR } from '../var'
import { styled } from '../styled'
import Marquee from 'react-fast-marquee'

const BrandImage = styled('img', {
  height: 64,
  color: VAR.text,
  display: 'inline-block',
  marginRight: 64,
  opacity: 0.7,
  transition: 'all 0.3s',
  filter: 'grayscale(100%)',
  '&:hover': {
    filter: 'grayscale(0)',
    opacity: 1,
  },
  '@mobile': {
    height: 42,
    marginRight: 42,
  }
})

const BrandIcon = styled('i', {
  fontSize: 64,
  color: VAR.text,
  display: 'inline-block',
  marginRight: 64,
  opacity: 0.7,
  transition: 'all 0.3s',
  '&:hover': {
    opacity: 1,
    color: VAR.title,
  },
  '@mobile': {
    fontSize: 42,
    marginRight: 42,
  }
})


const brands = [
  'icon-tianmaotmall',
  'icon-gaodeditu-quan',
  'icon-feizhulogo',
  'icon-credit_taobao_icon',
  'icon-zijietiaodong',
  'icon-dcaadaacdcabasvg',
  'icon-is-aliyun_logo',
  'icon-vivo',
  'https://img.alicdn.com/imgextra/i4/O1CN01RpFMeb1LiYexaZIcP_!!6000000001333-2-tps-320-150.png',
  'https://img.alicdn.com/imgextra/i3/O1CN010wn80L1UR01GSABXa_!!6000000002513-2-tps-277-121.png',
  'https://img.alicdn.com/imgextra/i3/O1CN01vsbUzd1T9J6X9VBg7_!!6000000002339-2-tps-400-400.png',
  'https://img.alicdn.com/imgextra/i1/O1CN01zw2fMc2266tFQCFQr_!!6000000007070-2-tps-704-255.png',
]

export function UsedBy() {
  return (
    <Block title="Used by" subtitle="Trusted by these great front-end teams" background="light">
      {renderMarquee(brands)}
    </Block>
  )
}

function renderMarquee(brands: string[]) {
  return (
    <Marquee gradient={false}>
      {brands.map((brand, index) => {
        if (brand.startsWith('http')) {
          return <BrandImage key={index} src={brand} />
        }
        return <BrandIcon key={index} className={`iconfont ${brand}`} />
      })}
    </Marquee>
  )
}
