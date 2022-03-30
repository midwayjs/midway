import { ApiProperty } from '../../../../../src';

export class CatT {
  /**
   * The name of the Catcomment
   * @example Kitty
   */
  @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
  namedt: string;

  @ApiProperty({ example: 1, description: 'The age of ttthe Cat' })
  agedt: number;

  @ApiProperty({
    example: 'Maine Coon',
    description: 'The breed tttof the Cat',
  })
  breedtd: string;
}
