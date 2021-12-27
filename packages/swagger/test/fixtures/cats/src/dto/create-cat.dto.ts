
import { ApiProperty } from "../../../../../src";

export enum HelloWorld {
  One = 'One',
  Two = 'Two',
  Three = 'Three',
}

export class CreateCatDto {
  @ApiProperty({ example: 'Kitty', description: 'The name of the Catname', format: 'binary'})
  name: string;

  @ApiProperty({ example: '1', description: 'The name of the Catage'})
  age: number;

  @ApiProperty({ example: 'bbbb', description: 'The name of the Catbreed'})
  breed: string;

  @ApiProperty({
    type: [String],
    example: ['1'],
    description: 'The name of the Catage'
  })
  breeds: string[];

  @ApiProperty({ enum: ['One', 'Two', 'Three'] })
  hello: HelloWorld;
}
