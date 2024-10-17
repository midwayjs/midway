import { getEnumValues } from "../src/common/enum.utils";

describe('/test/util.test.ts', () => {
  it('test enum get values', () => {
    enum StatusEnum {
      Disabled,
      Enabled,
    }

    expect(getEnumValues(StatusEnum)).toEqual([0, 1]);

    enum StatusEnum2 {
      Disabled = 'disabled',
      Enabled = 'enabled',
    }

    expect(getEnumValues(StatusEnum2)).toEqual(['disabled', 'enabled']);

    enum StatusEnum3 {
      Disabled = 1,
      Enabled = 2,
    }

    expect(getEnumValues(StatusEnum3)).toEqual([1, 2]);

    enum StatusEnum4 {
      Disabled = 'disabled',
      Enabled = 2,
    }

    expect(getEnumValues(StatusEnum4)).toEqual(['disabled', 2]);

    enum StatusEnum5 {
      Disabled = 2,
      Enabled = 'enabled',
    }

    expect(getEnumValues(StatusEnum5)).toEqual([2, 'enabled']);

    enum StatusEnum6 {
      Disabled = '1',
      Enabled = 2,
    }

    expect(getEnumValues(StatusEnum6)).toEqual(['1', 2]);

    enum StatusEnum7 {
      Disabled = 3,
      Enabled,
    }

    expect(getEnumValues(StatusEnum7)).toEqual([3, 4]);

    enum StatusEnum8 {
      Disabled = 1,
      Enabled = 1,
    }

    expect(getEnumValues(StatusEnum8)).toEqual([1]);

    expect(getEnumValues('test')).toEqual([]);
    expect(getEnumValues([1])).toEqual([1]);
    expect(getEnumValues([])).toEqual([]);
  });

});
