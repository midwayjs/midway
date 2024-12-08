import { useInject } from '@midwayjs/core/functional';

export default async function Home() {
  const result = (await useInject<{ hello(): Promise<string> }>('test')).hello();
  return (
    <div>
      <h1>Hello World</h1>
      <p>{result}</p>
    </div>
  );
}
