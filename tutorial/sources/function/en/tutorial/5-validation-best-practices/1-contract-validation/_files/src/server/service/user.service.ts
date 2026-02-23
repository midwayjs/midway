import { Provide } from '@midwayjs/core';

type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
};

@Provide()
export class UserService {
  private users: User[] = [
    { id: 'u-1', name: 'harry', email: 'harry@example.com', age: 20 },
    { id: 'u-2', name: 'tom', email: 'tom@example.com', age: 25 },
  ];

  async getUsers() {
    return this.users;
  }

  async searchUsers(keyword: string) {
    return this.users.filter(
      user => user.name.includes(keyword) || user.email.includes(keyword)
    );
  }

  async createUser(name: string, email: string, age?: number) {
    const user = {
      id: `u-${this.users.length + 1}`,
      name,
      email,
      age,
    };
    this.users.push(user);
    return user;
  }
}
