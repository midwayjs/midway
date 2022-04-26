import { Block } from './Block';
import React from 'react';
import { styled } from '../styled';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const ExtensionHref = styled('a', {
  display: 'flex',
  borderRadius: 8,
});

const Extension = styled('img', {
  height: 200,
  borderRadius: 8,
});

const RecommendList = [
  {
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01IZJkEY1bJrCKViAAc_!!6000000003445-2-tps-600-200.png',
    link: 'https://cool-js.com/',
    title: 'Cool js, 面向未来的后台开发框架',
  },
];

export function Recommend() {
  return (
    <Block title="Recommend" subtitle="Great extensions from the open source community" background="light">
      <Container>
        {RecommendList.map((item) => {
          return (
            <ExtensionHref key={item.link} href={item.link} target="_blank">
              <Extension alt={item.title} src={item.image} />
            </ExtensionHref>
          );
        })}
      </Container>
    </Block>
  );
}
