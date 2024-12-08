import { useInject } from '@midwayjs/core/functional';
export const dynamic = 'force-dynamic'

export default async function Home() {
  const result = (await useInject<{ hello(): Promise<string> }>('test')).hello();
  return (
    <div>
      <h1>{result}</h1>
    </div>
  );
}
