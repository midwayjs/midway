import { FORMAT } from '../../src'

describe('/test/util/format.test.ts', function () {
  it('should test MS constants', function () {
    expect(FORMAT.MS.ONE_SECOND).toEqual(1000);
    expect(FORMAT.MS.ONE_MINUTE).toEqual(60000);
    expect(FORMAT.MS.ONE_HOUR).toEqual(3600000);
    expect(FORMAT.MS.ONE_DAY).toEqual(86400000);
    expect(FORMAT.MS.ONE_WEEK).toEqual(604800000);
    expect(FORMAT.MS.ONE_YEAR).toEqual(31557600000);
  });

  it('should test crontab', function () {
    expect(FORMAT.CRONTAB).toMatchSnapshot();
  });
});
