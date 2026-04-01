import React from 'react'
import Layout from '@theme/Layout'
import { Splash } from '../components/Splash'
import { CoreFeatures } from '../components/CoreFeatures'
import { PreviewClassSyntax, PreviewFunctionSyntax, PreviewDivider } from '../components/Preview'
import { EssentialsComponents } from '../components/EssentialsComponents'
import { UsedBy } from '../components/UsedBy'
import { Footer } from '../components/Footer'
import { Example } from '../components/Example'
import { Recommend } from '../components/Recommend'

// 页面级进度指示条
function PageProgressBar() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background:
            'linear-gradient(90deg, var(--midway-primary, #4A00E0), var(--midway-secondary, #00D2FF))',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px var(--midway-secondary, #00D2FF)',
        }}
      />
    </div>
  )
}

export default function Home(): JSX.Element {
  const [hidden, setHidden] = React.useState(true)

  React.useEffect(() => {
    // 短暂延迟确保字体和样式都已加载，避免 FOUC
    const timer = setTimeout(() => setHidden(false), 60)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Layout noFooter>
      <PageProgressBar />
      <div
        style={{
          visibility: hidden ? 'hidden' : 'visible',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <Splash />
        <CoreFeatures />
        <PreviewClassSyntax />
        <PreviewDivider />
        <PreviewFunctionSyntax />
        <EssentialsComponents />
        <Example />
        <Recommend />
        <UsedBy />
        <Footer />
      </div>
    </Layout>
  )
}
