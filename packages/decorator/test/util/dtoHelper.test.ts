import {
  Rule,
  RuleType,
  getClassExtendedMetadata,
  RULES_KEY,
  PickDto,
  OmitDto,
} from '../../src';

class BaseDto {
  hello(): string {
    return 'hello midway';
  }

  @Rule(RuleType.number().integer())
  baseAttr: number;
}

class TestDto extends BaseDto {
  @Rule(RuleType.date())
  createTime: Date;

  @Rule(RuleType.string().max(64).description('产品名称').required())
  productName: string;

  @Rule(RuleType.number().description('价格').required())
  price: number;

  @Rule(RuleType.number().integer())
  quantity: number;

  addPrice(p: number): number {
    this.price += p;
    return this.price;
  }
}

describe('/test/util/dtoHelper.test.ts', () => {
  it('should test dto extend', async () => {
    class ChildDto extends TestDto {
      @Rule(RuleType.number().integer())
      id: number;

      @Rule(RuleType.string())
      quantity: number;

      @Rule(RuleType.string())
      comment: string;
    }
    const rules = getClassExtendedMetadata(RULES_KEY, ChildDto);
    const ruleKeys = Object.keys(rules);
    expect(ruleKeys.length).toBe(7);
    expect(ruleKeys.includes('id')).toBeTruthy();
    expect(ruleKeys.includes('price')).toBeTruthy();
    expect(ruleKeys.includes('quantity')).toBeTruthy();
    expect(ruleKeys.includes('baseAttr')).toBeTruthy();
    expect(rules.quantity.type).toEqual('string');
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
    class OmittedDto extends OmitDto(TestDto, ['productName']) {}
    const rules = getClassExtendedMetadata(RULES_KEY, OmittedDto);
    const ruleKeys = Object.keys(rules);
    expect(ruleKeys.length).toBe(4);
    expect(ruleKeys.includes('productName')).toBeFalsy();
    expect(ruleKeys.includes('quantity')).toBeTruthy();
  });

  it('should test method extend', async () => {
    class PickedDto extends PickDto(TestDto, ['price', 'addPrice', 'hello']) {}
    class OmittedDto extends OmitDto(TestDto, ['productName']) {}
    const pInst = new PickedDto();
    pInst.price = 10;
    expect(pInst.hello()).toEqual('hello midway');
    expect(pInst.addPrice(20)).toEqual(30);

    const oInst = new OmittedDto();
    oInst.price = 100;
    expect(oInst.hello()).toEqual('hello midway');
    expect(oInst.addPrice(-20)).toEqual(80);

    expect(pInst instanceof BaseDto).toBeTruthy();
    expect(oInst instanceof BaseDto).toBeTruthy();
  });
});
