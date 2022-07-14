import { isSemverGreaterThanOrEqualTo } from '../src/util';

describe('util.test.ts', function () {
  it('should test gte v14.8.0', function () {
    expect(isSemverGreaterThanOrEqualTo('v16.0.0', '14.8.0')).toBeTruthy();
    expect(isSemverGreaterThanOrEqualTo('v14.17.0', '14.8.0')).toBeTruthy();
    expect(isSemverGreaterThanOrEqualTo('v14.8.0', '14.8.0')).toBeTruthy();
    expect(isSemverGreaterThanOrEqualTo('v15.2.0', '14.8.0')).toBeTruthy();
    expect(isSemverGreaterThanOrEqualTo('v18.0.6', '14.8.0')).toBeTruthy();

    expect(isSemverGreaterThanOrEqualTo('v12', '14.8.0')).toBeFalsy();
    expect(isSemverGreaterThanOrEqualTo('v12.10.0', '14.8.0')).toBeFalsy();
    expect(isSemverGreaterThanOrEqualTo('v13.8.0', '14.8.0')).toBeFalsy();
    expect(isSemverGreaterThanOrEqualTo('v14.7.0', '14.8.0')).toBeFalsy();
  });
});
