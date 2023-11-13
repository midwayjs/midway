import { ApiExtraModel, ApiProperty, getSchemaPath } from '../../../../../src';
import { Catd } from './catd.entity';
import { Rel } from './utils';

@ApiExtraModel(Catd)
export class Cat {
  /**
   * The name of the Catcomment
   * @example Kitty
   */
  @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
  name: string;

  @ApiProperty({ example: 1, description: 'The age of the Cat' })
  age: number;

  @ApiProperty({
    example: '2022-12-12 11:11:11',
    description: 'The age of the CatDSate',
  })
  agedata?: Date;

  @ApiProperty({
    example: 'Maine Coon',
    description: 'The breed of the Cat',
  })
  breed: string;

  @ApiProperty({
    description: 'The breed of the Cat',
    required: false,
    type: 'array',
    items: {
      $ref: getSchemaPath(Catd),
    },
  })
  catds: Catd[];

  @ApiProperty({
    type: 'array',
    items: {
      type: () => Cat,
    },
  })
  children?: Rel<Cat>[];

  @ApiProperty({
    type: 'array',
    items: {
      $ref: getSchemaPath(Cat),
    },
  })
  childrenWithRef?: Rel<Cat>[];

  @ApiProperty({
    $ref: '#/components/schemas/Cat',
  })
  mother?: Cat;

  @ApiProperty({
    type: () => Cat,
  })
  father?: Cat;
}
