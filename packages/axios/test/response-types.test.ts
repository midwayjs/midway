import { Axios, AxiosResponse, HttpService } from '../src';

/** Verify response types and interceptor results across all service methods. */
describe('HttpService response types', () => {
  const data = { message: 'hello' };

  function createService(unwrapResponse = false): HttpService {
    const instance = Axios.create({
      adapter: async config => ({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    });
    if (unwrapResponse) {
      instance.interceptors.response.use(response => response.data);
    }
    return Object.assign(new HttpService(), { instance });
  }

  it('preserves the default typed Axios response', async () => {
    const service = createService();
    const response: AxiosResponse<typeof data> = await service.get<typeof data>(
      '/test'
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('hello');
  });

  it('preserves custom response types returned by interceptors', async () => {
    const service = createService(true);
    type Data = typeof data;
    const responses: Promise<Data>[] = [
      service.request<Data, Data>({ url: '/test' }),
      service.get<Data, Data>('/test'),
      service.delete<Data, Data>('/test'),
      service.head<Data, Data>('/test'),
      service.options<Data, Data>('/test'),
      service.post<Data, Data, Data>('/test', data),
      service.put<Data, Data, Data>('/test', data),
      service.patch<Data, Data, Data>('/test', data),
      service.postForm<Data, Data, Data>('/test', data),
      service.putForm<Data, Data, Data>('/test', data),
      service.patchForm<Data, Data, Data>('/test', data),
    ];
    for (const response of await Promise.all(responses)) {
      expect(response.message).toBe('hello');
      expect(response).toEqual(data);
    }
  });
});
