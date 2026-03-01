import { BaseCrudService, CrudFeatureNotSupportedError, CrudNotFoundError } from '../src';

class TestCrudService extends BaseCrudService<any> {
  async list() {
    return this.normalizePageResult([], 1, 0, 0);
  }

  async findOne() {
    return null;
  }

  async create(data: any) {
    return data;
  }

  async update(_id: any, data: any) {
    return data;
  }

  async delete() {}

  exposeNormalizePageMeta(page: number, limit: number, total: number) {
    return this.normalizePageMeta(page, limit, total);
  }

  exposeAssertEntityFound<T>(entity: T | null, message?: string) {
    return this.assertEntityFound(entity, message);
  }

  exposeResolveDeleteMode() {
    return this.resolveDeleteMode();
  }

  exposeAssertSoftDeleteSupported(supported: boolean) {
    return this.assertSoftDeleteSupported(supported);
  }
}

describe('BaseCrudService helpers', () => {
  it('should fallback page meta for non-positive limits and empty totals', () => {
    const service = new TestCrudService();
    const meta = service.exposeNormalizePageMeta(1, 0, 0);

    expect(meta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      pageCount: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('should calculate next/prev flags and support replace defaulting to update', async () => {
    const service = new TestCrudService();
    const meta = service.exposeNormalizePageMeta(2, 10, 25);

    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
    await expect(service.replace(1, { ok: true })).resolves.toEqual({ ok: true });
  });

  it('should expose entity, delete mode and soft delete guards', () => {
    const service = new TestCrudService();
    expect(service.exposeAssertEntityFound({ ok: true })).toEqual({ ok: true });
    expect(() => service.exposeAssertEntityFound(null, 'missing')).toThrow(
      CrudNotFoundError
    );
    expect(service.exposeResolveDeleteMode()).toBe('hard');

    service.setCrudOptions({
      model: class TestModel {} as any,
      service: class TestService {} as any,
      delete: {
        mode: 'soft',
      },
    });
    expect(service.exposeResolveDeleteMode()).toBe('soft');
    expect(() => service.exposeAssertSoftDeleteSupported(true)).not.toThrow();
    expect(() => service.exposeAssertSoftDeleteSupported(false)).toThrow(
      CrudFeatureNotSupportedError
    );
  });
});
