import React from 'react'
import { styled } from '../styled'
import { keyframes } from '@stitches/react'
import Translate from '@docusaurus/Translate'

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(30px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const flowBorder = keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '100%': { backgroundPosition: '200% 50%' },
});

const iconGlow = keyframes({
  '0%, 100%': { boxShadow: '0 0 0px transparent' },
  '50%': { boxShadow: '0 0 12px var(--midway-glow)' },
});

const Container = styled('div', {
  padding: '140px 0',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--midway-bg)',

  // 顶部分隔线渐变
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--midway-border), transparent)',
  },

  // 背景点阵
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(var(--midway-grid) 1px, transparent 1px)`,
    backgroundSize: '30px 30px',
    opacity: 0.3,
    pointerEvents: 'none',
  },

  '@mobile': {
    padding: '80px 0',
  }
})

const Content = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  position: 'relative',
  zIndex: 2,

  '@mobile': {
    padding: '0 16px',
  }
})

const SectionTitle = styled('div', {
  marginBottom: '60px',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out`,
})

const SectionLabel = styled('div', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.85rem',
  color: 'var(--midway-secondary)',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',

  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '20px',
    height: '1px',
    background: 'var(--midway-secondary)',
  },
  '&::after': {
    content: '""',
    display: 'inline-block',
    width: '20px',
    height: '1px',
    background: 'var(--midway-secondary)',
  }
})

const SectionHeading = styled('h2', {
  fontSize: '2.8rem',
  fontWeight: 800,
  color: 'var(--midway-text-main)',
  margin: '0 0 10px 0',
  display: 'inline-block',
  position: 'relative',

  '&::after': {
    content: '""',
    display: 'block',
    width: '40%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, var(--midway-secondary), transparent)',
    margin: '10px auto 0',
    borderRadius: '2px',
  }
})

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',

  '@mobile': {
    gridTemplateColumns: '1fr',
    gap: '14px',
  },
})

// 流光边框容器
const CardWrapper = styled('div', {
  position: 'relative',
  borderRadius: '6px',
  padding: '1px',
  background: 'var(--midway-border)',
  transition: 'background 0.3s',

  '&:hover': {
    background: 'linear-gradient(90deg, var(--midway-primary), var(--midway-secondary), var(--midway-primary))',
    backgroundSize: '200% 100%',
    animation: `${flowBorder} 2s linear infinite`,

    '& .arrow-icon': {
      opacity: 1,
      transform: 'translateY(-50%) translateX(0px)',
    },

    '& .icon': {
      color: 'var(--midway-primary)',
      animation: `${iconGlow} 1.5s ease-in-out infinite`,
    },

    '& .card-label': {
      color: 'var(--midway-primary)',
    }
  },
})

const ComponentCard = styled('a', {
  display: 'flex',
  alignItems: 'center',
  padding: '20px 22px',
  background: 'var(--midway-surface)',
  borderRadius: '5px',
  textDecoration: 'none',
  transition: 'all 0.3s',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',

  '&:hover': {
    textDecoration: 'none',
  },

  // 悬停内部高光
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
    opacity: 0,
    transition: 'opacity 0.3s',
    pointerEvents: 'none',
  },

  '&:hover::before': {
    opacity: 1,
  }
})

const IconWrapper = styled('div', {
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--midway-bg)',
  border: '1px solid var(--midway-border)',
  borderRadius: '6px',
  marginRight: '16px',
  flexShrink: 0,
  transition: 'all 0.3s',
})

const Icon = styled('i', {
  fontSize: '24px',
  color: 'var(--midway-text-sec)',
  transition: 'color 0.3s',
})

const TextWrapper = styled('div', {
  flex: 1,
  minWidth: 0,
})

const CardTitle = styled('h4', {
  fontSize: '1.05rem',
  fontWeight: 700,
  color: 'var(--midway-text-main)',
  margin: '0 0 3px 0',
  transition: 'color 0.3s',
})

const CardDesc = styled('p', {
  fontSize: '0.85rem',
  color: 'var(--midway-text-sec)',
  margin: 0,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

const ArrowIcon = styled('i', {
  position: 'absolute',
  right: '18px',
  top: '50%',
  transform: 'translateY(-50%) translateX(-8px)',
  fontSize: '16px',
  color: 'var(--midway-primary)',
  opacity: 0,
  transition: 'all 0.3s ease',
  flexShrink: 0,
})

type ComponentProps = {
  icon: string
  title: string
  link: string
  description: string
}

function Component(props: ComponentProps) {
  return (
    <CardWrapper>
      <ComponentCard href={props.link} target="_blank">
        <IconWrapper>
          <Icon className={`iconfont ${props.icon} icon`} />
        </IconWrapper>
        <TextWrapper>
          <CardTitle className="card-label">{props.title}</CardTitle>
          <CardDesc>{props.description}</CardDesc>
        </TextWrapper>
        <ArrowIcon className="iconfont icon-arrow-right arrow-icon" />
      </ComponentCard>
    </CardWrapper>
  )
}

const components = [
  {
    title: 'ORM',
    link: '/docs/extensions/orm',
    description: 'TypeORM-based database SDK',
    icon: 'icon-database_plus_fill',
  },
  {
    title: 'Redis',
    link: '/docs/extensions/redis',
    description: 'In-memory data store',
    icon: 'icon-redis',
  },
  {
    title: 'Swagger',
    link: '/docs/extensions/swagger',
    description: 'Auto-generate OpenAPI docs',
    icon: 'icon-swagger',
  },
  {
    title: 'Mongodb',
    link: '/docs/extensions/mongodb',
    description: 'Flexible NoSQL database',
    icon: 'icon-MongoDB',
  },
  {
    title: 'Cache',
    link: '/docs/extensions/cache',
    description: 'In-memory cache layer',
    icon: 'icon-memcacheyunshujukuMemcac',
  },
  {
    title: 'OSS',
    link: '/docs/extensions/oss',
    description: 'Aliyun object storage',
    icon: 'icon-ossduixiangcunchuOSS',
  },
  {
    title: 'gRPC',
    link: '/docs/extensions/grpc',
    description: 'High-performance RPC protocol',
    icon: 'icon-grpc',
  },
  {
    title: 'RabbitMQ',
    link: '/docs/extensions/rabbitmq',
    description: 'Message queue integration',
    icon: 'icon-mq',
  },
  {
    title: 'Kafka',
    link: '/docs/extensions/kafka',
    description: 'Distributed event streaming',
    icon: 'icon-kafka',
  },
  {
    title: 'Validate',
    link: '/docs/extensions/validate',
    description: 'Parameter & schema validation',
    icon: 'icon-shujuyanzheng',
  },
  {
    title: 'JWT',
    link: '/docs/extensions/jwt',
    description: 'Token-based auth',
    icon: 'icon-token',
  },
  {
    title: 'Prometheus',
    link: '/docs/extensions/prometheus',
    description: 'Metrics & monitoring',
    icon: 'icon-prometheus',
  },
] as ComponentProps[]

const GridFadeWrapper = styled('div', {
  position: 'relative',

  // 底部渐隐遮罩 - 按主题色深度渐变
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '120px',
    background: 'linear-gradient(to bottom, transparent, var(--midway-bg))',
    pointerEvents: 'none',
    zIndex: 3,
  }
})

const ViewAllRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '36px',
  gap: '16px',
})

const ViewAllButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 28px',
  border: '1px solid var(--midway-border)',
  color: 'var(--midway-text-main)',
  background: 'var(--midway-surface)',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.3s',
  backdropFilter: 'blur(8px)',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
    transition: 'left 0.4s',
  },

  '&:hover': {
    borderColor: 'var(--midway-primary)',
    color: 'var(--midway-primary)',
    textDecoration: 'none',
    boxShadow: '0 0 20px var(--midway-glow)',
    transform: 'translateY(-2px)',

    '&::before': { left: '100%' },
  }
})

const ComponentCount = styled('span', {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.8rem',
  color: 'var(--midway-text-sec)',
  letterSpacing: '0.05em',
})

export function EssentialsComponents() {
  return (
    <Container>
      <Content>
        <SectionTitle>
          <SectionLabel>04 // Ecosystem</SectionLabel>
          <SectionHeading>
            <Translate id="homepage.essentials.title">
              Core Extensions
            </Translate>
          </SectionHeading>
        </SectionTitle>

        <GridFadeWrapper>
          <Grid>
            {components.map((component, index) => (
              <div key={index} style={{ animation: `${fadeInUp} 0.7s ease-out ${0.06 + index * 0.06}s both` }}>
                <Component {...component} />
              </div>
            ))}
          </Grid>
        </GridFadeWrapper>

        <ViewAllRow>
          <ComponentCount>Showing {components.length} of 50+ extensions</ComponentCount>
          <ViewAllButton href="/docs/extensions/orm">
            Browse all extensions
            <i className="iconfont icon-arrow-right" />
          </ViewAllButton>
        </ViewAllRow>
      </Content>
    </Container>
  )
}
