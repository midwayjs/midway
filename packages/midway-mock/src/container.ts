import {Container} from 'midway-context';

export class MidwayMockContainer extends Container {


}


export function mockContainer(options: {
  load: () => void
}) {
  const container =  new MidwayMockContainer(options);
  container.load();
}
