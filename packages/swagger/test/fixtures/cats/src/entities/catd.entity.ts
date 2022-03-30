import { ApiProperty } from '../../../../../src';

export class Catd {
  /**
   * The name of the Catcomment
   * @example Kitty
   */
  @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
  named: string;

  @ApiProperty({ example: 1, description: 'The age of the Cat' })
  aged: number;

  @ApiProperty({
    example: 'Maine Coon',
    description: 'The breed of the Cat',
  })
  breedd: string;
}
