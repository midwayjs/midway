import { ApiProperty } from '../../../../../src';

export class OssUploadResponseDataDto {
  @ApiProperty({
    example: '11',
    description: 'oss文件路径',
  })
  name: string;
  @ApiProperty({
    example: '12',
    description: '阿里云地址',
  })
  url: string;
  @ApiProperty({
    example: '11',
    description: 'cdn地址',
  })
  path: string;
}

export class OssUploadResponseDto {
  @ApiProperty({
    example: 'true',
    description: '请求是否成功',
  })
  success: boolean;

  @ApiProperty({
    type: OssUploadResponseDataDto,
    description: '返回数据',
    example: 'data:{name:"12",url:"11",path:"11"}',
  })
  data: OssUploadResponseDataDto;
}

export class OssMultipleUploadResponseDto {
  @ApiProperty({
    example: 'true',
    description: '请求是否成功',
  })
  success: boolean;
  @ApiProperty({
    type: [OssUploadResponseDataDto],
    description: '返回数据'
  })
  data: OssUploadResponseDataDto[];
}