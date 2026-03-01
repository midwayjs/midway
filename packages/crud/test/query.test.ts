import { parseCrudId, parseCrudQuery } from '../src';

class TestModel {}
class TestService {}

const options = {
  model: TestModel,
  service: TestService as any,
  query: {
    sortable: ['id', 'createdAt'],
    filterable: ['status'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
};

describe('parseCrudQuery', () => {
  it('should parse a valid query shape', () => {
    const query = parseCrudQuery(
      {
        page: '2',
        limit: '30',
        sort: ['createdAt:DESC', 'id:ASC'],
        filter: 'status||eq||active',
        search: 'harry',
        join: 'profile',
        fields: 'id,name',
      },
      options
    );

    expect(query.page).toBe(2);
    expect(query.limit).toBe(30);
    expect(query.sort).toHaveLength(2);
    expect(query.filters[0].operator).toBe('eq');
    expect(query.joins).toEqual(['profile']);
    expect(query.fields).toEqual(['id', 'name']);
  });

  it('should reject nested joins', () => {
    expect(() =>
      parseCrudQuery(
        {
          join: 'profile.company',
        },
        options
      )
    ).toThrow('Nested joins are not supported');
  });

  it('should reject search when searchable is not configured', () => {
    expect(() =>
      parseCrudQuery(
        {
          search: 'harry',
        },
        {
          model: TestModel,
          service: TestService as any,
        }
      )
    ).toThrow('"search" is not enabled for this resource');
  });

  it('should parse a single-key id and reject missing ids', () => {
    expect(parseCrudId('12', options)).toBe(12);
    expect(parseCrudId('user_1', options)).toBe('user_1');
    expect(() => parseCrudId(undefined, options)).toThrow('Missing resource id');
  });

  it('should allow one-level joins', () => {
    const query = parseCrudQuery(
      {
        join: ['profile'],
      },
      options
    );

    expect(query.joins).toEqual(['profile']);
  });

  it('should support array inputs and clamp limit to maxLimit', () => {
    const query = parseCrudQuery(
      {
        page: ['3'],
        limit: ['999'],
        sort: [['id:ASC']],
        filter: [['status||eq||active']],
        join: [['profile']],
      },
      {
        ...options,
        query: {
          ...options.query,
          maxLimit: 50,
        },
      }
    );

    expect(query.page).toBe(3);
    expect(query.limit).toBe(50);
    expect(query.sort[0]).toEqual({ field: 'id', order: 'ASC' });
    expect(query.filters[0]).toEqual({
      field: 'status',
      operator: 'eq',
      value: 'active',
    });
  });

  it('should reject invalid paging, sort and filter fragments', () => {
    expect(() => parseCrudQuery({ page: '0' }, options)).toThrow('Invalid "page" value');
    expect(() => parseCrudQuery({ limit: '-1' }, options)).toThrow(
      'Invalid "limit" value'
    );
    expect(() => parseCrudQuery({ sort: 'id' }, options)).toThrow(
      'Invalid "sort" format'
    );
    expect(() => parseCrudQuery({ sort: 'id:DOWN' }, options)).toThrow(
      'Invalid "sort" direction'
    );
    expect(() => parseCrudQuery({ filter: 'status||eq' }, options)).toThrow(
      'Invalid "filter" format'
    );
    expect(() => parseCrudQuery({ filter: 'status||||x' }, options)).toThrow(
      'Invalid "filter" format'
    );
    expect(() => parseCrudQuery({ filter: 'status||between||x' }, options)).toThrow(
      'Unsupported filter operator "between"'
    );
    expect(() => parseCrudQuery({ filter: 'status||in||' }, options)).toThrow(
      'Invalid "in" filter value'
    );
  });

  it('should reject unconfigured or unauthorized sort/filter/join and empty search', () => {
    expect(() =>
      parseCrudQuery(
        { sort: 'name:ASC' },
        {
          model: TestModel,
          service: TestService as any,
        }
      )
    ).toThrow('"sort" is not enabled for this resource');
    expect(() => parseCrudQuery({ sort: 'name:ASC' }, options)).toThrow(
      '"name" is not allowed in sort'
    );
    expect(() => parseCrudQuery({ filter: 'name||eq||x' }, options)).toThrow(
      '"name" is not allowed in filter'
    );
    expect(() => parseCrudQuery({ join: 'company' }, options)).toThrow(
      '"company" is not allowed in join'
    );
    expect(() => parseCrudQuery({ search: '   ' }, options)).toThrow(
      'Invalid "search" value'
    );
  });

  it('should omit fields when not provided', () => {
    const query = parseCrudQuery({}, options);
    expect(query.fields).toBeUndefined();
  });
});
