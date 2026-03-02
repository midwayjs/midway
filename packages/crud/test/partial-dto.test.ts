import { registry } from '../../validation/src/registry';
import { PartialDto } from '../../validation/src/dtoHelper';
import { createCrudRouteHandler } from '../src';

class UserModel {}
class UserService {}
class UserUpdateDto {
  name: string;
}

describe('PartialDto compatibility', () => {
  beforeEach(() => {
    registry.clear();
    registry.register('mock', {
      schemaHelper: {
        isRequired: jest.fn(),
        isOptional: jest.fn(),
        setRequired: jest.fn(),
        setOptional: jest.fn(),
        getSchema: jest.fn(),
        getIntSchema: jest.fn(),
        getBoolSchema: jest.fn(),
        getFloatSchema: jest.fn(),
        getStringSchema: jest.fn(),
      },
      validateServiceHandler: jest.fn(),
    } as any);
    registry.setFirstValidatorToDefault();
  });

  afterEach(() => {
    registry.clear();
  });

  it('should accept PartialDto generated update DTOs in CRUD validation', async () => {
    const validate = jest.fn();
    const UpdateDto = PartialDto(UserUpdateDto);
    const handler = createCrudRouteHandler(
      'update',
      {
        crudService: {
          update: jest.fn().mockResolvedValue({ ok: true }),
        },
      },
      {
        model: UserModel,
        service: UserService as any,
        dto: {
          update: UpdateDto as any,
        },
      }
    );

    await handler({
      params: { id: '1' },
      body: { name: 'neo' },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({
            validate,
          }),
        },
      },
    });

    expect(validate).toHaveBeenCalledWith(UpdateDto, { name: 'neo' });
  });
});
