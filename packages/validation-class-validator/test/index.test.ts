import { createLightApp, close } from '@midwayjs/mock';
import { ValidationService } from '@midwayjs/validation';
import * as validation from '@midwayjs/validation';
import { IsString, IsNumber, Min, Max, IsOptional, ValidateIf } from 'class-validator';

import classValidator from '../src/index';

describe('test/index.test.ts', () => {
  describe('validation service test with class validator', () => {
    it('should validate class successfully', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
          }
        }
      });

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 'harry',
        age: 18
      });

      expect(result.status).toBeTruthy();
      expect(result.value.name).toEqual('harry');
      expect(result.value.age).toEqual(18);

      await close(app);
    });

    it('should throw error for invalid data', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
          }
        }
      });

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 123,  // should be string
        age: 'abc'  // should be number
      }, {
        locale: 'zh-CN',
        throwValidateError: false
      });

      expect(result.status).toBeFalsy();
      expect(result.message).toContain('name 必须是字符串');
      expect(result.messages).toEqual(['name 必须是字符串', 'age 不能大于 100, age 不能小于 0, age 必须是符合指定约束的数字']);
      await close(app);
    });

    it('should validate conditionally based on ValidateIf', async () => {
      class ConditionalDTO {
        @ValidateIf((o) => o.type === 'test')
        @IsString()
        name: string;

        @IsString()
        type: string;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
          }
        }
      });

      const validationService = await app.getApplicationContext().getAsync(ValidationService);

      // 当 type 不是 'test' 时，name 可以是任何值或不存在
      const result1 = await validationService.validate(ConditionalDTO, {
        type: 'other',
        name: 123  // 即使不是字符串也可以
      });
      expect(result1.status).toBeTruthy();

      // 当 type 是 'test' 时，name 必须是字符串
      const result2 = await validationService.validate(ConditionalDTO, {
        type: 'test',
        name: 123  // 这时会验证失败，因为不是字符串
      }, {
        throwValidateError: false
      });
      expect(result2.status).toBeFalsy();
      expect(result2.message).toContain('name must be a string');

      // type 字段始终需要是字符串
      const result3 = await validationService.validate(ConditionalDTO, {
        type: 123,  // 这里会验证失败
        name: 'test'
      }, {
        throwValidateError: false
      });
      expect(result3.status).toBeFalsy();
      expect(result3.message).toContain('type must be a string');

      await close(app);
    });
  });

  describe('schema helper test with class validator', () => {
    it('should return true for optional field', () => {
      class UserDTO {
        @IsOptional()
        name: string;
      }

      expect(classValidator.schemaHelper.isOptional(UserDTO, 'name')).toBeTruthy();
    });

    it('should return false for required field', () => {
      class UserDTO {
        @IsString()
        name: string;
      }

      expect(classValidator.schemaHelper.isRequired(UserDTO, 'name')).toBeTruthy();
    });

    it('should return true for optional field with multiple decorators', () => {
      class UserDTO {
        @IsString()
        @IsOptional()
        name: string;
      }

      expect(classValidator.schemaHelper.isOptional(UserDTO, 'name')).toBeTruthy();
    });

    it('should return true for field with conditional validation', () => {
      class ConditionalDTO {
        @ValidateIf((o) => o.type === 'test')
        @IsString()
        name: string;

        @IsString()
        type: string;
      }

      // 当有 @ValidateIf 时，字段应该被认为是可选的
      expect(classValidator.schemaHelper.isOptional(ConditionalDTO, 'name')).toBeTruthy();
      // type 字段没有条件验证，应该是必需的
      expect(classValidator.schemaHelper.isRequired(ConditionalDTO, 'type')).toBeTruthy();
    });

    it('should handle conditional validation correctly', () => {
      class ConditionalDTO {
        @ValidateIf((o) => o.type === 'test')
        @IsString()
        name: string;

        @IsString()
        type: string;
      }

      expect(classValidator.schemaHelper.isOptional(ConditionalDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(ConditionalDTO, 'name')).toBeFalsy();

      // 添加 IsOptional 后字段变为可选
      class ConditionalOptionalDTO {
        @ValidateIf((o) => o.type === 'test')
        @IsOptional()
        @IsString()
        name: string;

        @IsString()
        type: string;
      }

      expect(classValidator.schemaHelper.isOptional(ConditionalOptionalDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(ConditionalOptionalDTO, 'name')).toBeFalsy();
    });

    it('should test setRequired for single property', () => {
      class RequiredTestDTO {
        @IsString()
        name: string;

        @IsNumber()
        @IsOptional()
        age?: number;
      }

      // 先验证初始状态
      expect(classValidator.schemaHelper.isOptional(RequiredTestDTO, 'age')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(RequiredTestDTO, 'age')).toBeFalsy();

      // 设置 age 为必需
      classValidator.schemaHelper.setRequired(RequiredTestDTO, 'age');

      // 验证状态改变
      expect(classValidator.schemaHelper.isOptional(RequiredTestDTO, 'age')).toBeFalsy();
      expect(classValidator.schemaHelper.isRequired(RequiredTestDTO, 'age')).toBeTruthy();
    });

    it('should test setOptional for single property', () => {
      class SingleDTO {
        @IsString()
        name: string;

        @IsNumber()
        age: number;
      }

      // 先验证初始状态
      expect(classValidator.schemaHelper.isOptional(SingleDTO, 'name')).toBeFalsy();
      expect(classValidator.schemaHelper.isRequired(SingleDTO, 'name')).toBeTruthy();

      // 设置 name 为可选
      classValidator.schemaHelper.setOptional(SingleDTO, 'name');

      // 验证状态改变
      expect(classValidator.schemaHelper.isOptional(SingleDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(SingleDTO, 'name')).toBeFalsy();
    });

    it('should test setRequired for all properties', () => {
      class TestDTO {
        @IsString()
        @IsOptional()
        name?: string;

        @IsNumber()
        @IsOptional()
        age?: number;

        @IsString()
        @IsOptional()
        description?: string;
      }

      // 先验证初始状态
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'age')).toBeTruthy();
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'description')).toBeTruthy();

      // 设置所有属性为必需
      classValidator.schemaHelper.setRequired(TestDTO);

      // 验证所有属性状态改变
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'age')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'description')).toBeTruthy();
    });

    it('should test setOptional for all properties', () => {
      class TestDTO {
        @IsString()
        name: string;

        @IsNumber()
        age: number;

        @IsString()
        description: string;
      }

      // 先验证初始状态
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'age')).toBeTruthy();
      expect(classValidator.schemaHelper.isRequired(TestDTO, 'description')).toBeTruthy();

      // 设置所有属性为可选
      classValidator.schemaHelper.setOptional(TestDTO);

      // 验证所有属性状态改变
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'name')).toBeTruthy();
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'age')).toBeTruthy();
      expect(classValidator.schemaHelper.isOptional(TestDTO, 'description')).toBeTruthy();
    });

    it('should test basic schema helpers', () => {
      // 测试整数
      expect(typeof classValidator.schemaHelper.getIntSchema()).toBe('function');
      expect(classValidator.schemaHelper.getIntSchema().name).toBe('Number');

      // 测试布尔值
      expect(typeof classValidator.schemaHelper.getBoolSchema()).toBe('function');
      expect(classValidator.schemaHelper.getBoolSchema().name).toBe('Boolean');

      // 测试浮点数
      expect(typeof classValidator.schemaHelper.getFloatSchema()).toBe('function');
      expect(classValidator.schemaHelper.getFloatSchema().name).toBe('Number');

      // 测试字符串
      expect(typeof classValidator.schemaHelper.getStringSchema()).toBe('function');
      expect(classValidator.schemaHelper.getStringSchema().name).toBe('String');
    });
  });
});
