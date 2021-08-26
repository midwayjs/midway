import {
  Rule,
  RuleType,
  getClassExtendedMetadata,
  RULES_KEY,
  PickDto,
  OmitDto,
} from '../../src';

class TestDto {
  @Rule(RuleType.date())
  createTime: Date;

  @Rule(RuleType.string().max(64).description('产品名称').required())
  productName: string;

  @Rule(RuleType.number().description('价格').required())
  price: number;

  @Rule(RuleType.number().integer())
  quantity: number;
}

describe('/test/util/dtoHelper.test.ts', () => {
  it('should test dto extend', async () => {
    class ChildDto extends TestDto {
      @Rule(RuleType.number().integer())
      id: number;

      @Rule(RuleType.number().integer().max(5))
      quantity: number;

      @Rule(RuleType.string())
      comment: string;
    }
    const rules = getClassExtendedMetadata(RULES_KEY, ChildDto);
    const ruleKeys = Object.keys(rules);
    expect(ruleKeys.length).toBe(6);
    expect(ruleKeys.includes('id')).toBeTruthy();
    expect(ruleKeys.includes('price')).toBeTruthy();
    expect(ruleKeys.includes('quantity')).toBeTruthy();
  });

  it('should test PickDto', async () => {
    class PickedDto extends PickDto(TestDto, ['createTime', 'price']) {}
    const rules = getClassExtendedMetadata(RULES_KEY, PickedDto);
    const ruleKeys = Object.keys(rules);
    expect(ruleKeys.length).toBe(2);
    expect(ruleKeys.includes('quantity')).toBeFalsy();
    expect(ruleKeys.includes('createTime')).toBeTruthy();
  });

  it('should test OmitDto', async () => {
    class PickedDto extends OmitDto(TestDto, ['productName']) {}
    const rules = getClassExtendedMetadata(RULES_KEY, PickedDto);
    const ruleKeys = Object.keys(rules);
    expect(ruleKeys.length).toBe(3);
    expect(ruleKeys.includes('productName')).toBeFalsy();
    expect(ruleKeys.includes('quantity')).toBeTruthy();
  });
});
