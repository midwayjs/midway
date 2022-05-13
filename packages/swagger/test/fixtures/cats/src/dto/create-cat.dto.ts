
import { ApiProperty } from "../../../../../src";
import { Catd } from "../entities/catd.entity";

export enum HelloWorld {
  One = 'One',
  Two = 'Two',
  Three = 'Three',
}

export class CreateCatDto {
  @ApiProperty({ example: 'Kitty', description: 'The name of the Catname', format: 'binary'})
  name: string;

  @ApiProperty({ 
    example: '1',
    description: 'The name of the Catage',
    maximum: 10,
    maxItems: 1,
    maxLength: 1,
    maxProperties: 2
  })
  age: number;

  @ApiProperty({ example: '2022-12-12 11:11:11', description: 'The age of the CatDSate' })
  agedata?: Date;

  @ApiProperty({ example: 'bbbb', description: 'The name of the Catbreed'})
  breed: string;

  @ApiProperty({
    type: [String],
    example: ['1'],
    description: 'The name of the Catage',
    nullable: true,
    uniqueItems: true,
  })
  breeds: string[];

  @ApiProperty({ enum: ['One', 'Two', 'Three'] })
  hello: HelloWorld;

  catds: Catd[];
}
