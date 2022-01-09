import React from 'react'
import Layout from '@theme/Layout'
import { Splash } from '../components/Splash'
import { CoreFeatures } from '../components/CoreFeatures'
import { PreviewClassSyntax, PreviewFunctionSyntax } from '../components/Preview'
import { EssentialsComponents } from '../components/EssentialsComponents'
import { UsedBy } from '../components/UsedBy'
import { Footer } from '../components/Footer'
import { Example } from '../components/Example'

export default function Home(): JSX.Element {
  const [hidden, setHidden] = React.useState(true)

  React.useEffect(() => {
    setHidden(false)
  }, [])

  return (
    <Layout>
      <div style={{ visibility: hidden ? 'hidden' : 'visible' }}>
        <Splash />
        <CoreFeatures />
        <PreviewClassSyntax />
        <PreviewFunctionSyntax />
        <EssentialsComponents />
        <Example />
        <UsedBy />
        <Footer />
      </div>
    </Layout>
  )
}
