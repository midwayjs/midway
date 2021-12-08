
import { ApiProperty } from "../../../../../src";

export class CreateCatDto {
  @ApiProperty({ example: 'Kitty', description: 'The name of the Catname'})
  name: string;

  @ApiProperty({ example: '1', description: 'The name of the Catage'})
  age: number;

  @ApiProperty({ example: 'bbbb', description: 'The name of the Catbreed'})
  breed: string;
}
