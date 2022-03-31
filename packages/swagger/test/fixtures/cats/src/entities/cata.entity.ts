import { ApiExtraModel, ApiProperty, getSchemaPath } from '../../../../../src';
import { Catd } from './catd.entity';

@ApiExtraModel(Catd)
export class Cata {
  /**
   * The name of the Catcomment
   * @example Kitty
   */
  @ApiProperty({ example: 'Kitty', description: 'The name aaof the Cat'})
  namea: string;

  @ApiProperty({ example: 1, description: 'The age of thaae Cat' })
  agea: number;

  @ApiProperty({
    example: 'Maine Coon',
    description: 'The breed of taahe Cat',
  })
  breeda: string;

  @ApiProperty({
    description: 'The breed of the Cat',
    required: false,
    type: 'array',
    items: {
      $ref: getSchemaPath(Catd)
    }
  })
  catdsa: Catd[];
}
