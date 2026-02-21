import { Bootstrap } from '../src';

describe('bootstrap idempotent run', () => {
  afterEach(() => {
    Bootstrap.reset();
    jest.restoreAllMocks();
  });

  it('should reuse running promise when run is called repeatedly', async () => {
    const runMock = jest.fn().mockResolvedValue(undefined);
    const starter = {
      run: runMock,
    } as any;

    jest
      .spyOn(Bootstrap as any, 'getStarter')
      .mockImplementation(() => starter);
    jest
      .spyOn(Bootstrap as any, 'getApplicationContext')
      .mockImplementation(() => ({}));

    (Bootstrap as any).configured = true;
    (Bootstrap as any).logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const running1 = Bootstrap.run();
    const running2 = Bootstrap.run();

    expect(runMock).toHaveBeenCalledTimes(1);
    await Promise.all([running1, running2]);
  });
});
