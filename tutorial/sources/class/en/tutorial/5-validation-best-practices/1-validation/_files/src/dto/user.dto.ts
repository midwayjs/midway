export class CreateUserDTO {
  name: string;
  email: string;
  age?: number;
}

export class UpdateUserDTO {
  name?: string;
  email?: string;
  age?: number;
}

export class QueryUserDTO {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
