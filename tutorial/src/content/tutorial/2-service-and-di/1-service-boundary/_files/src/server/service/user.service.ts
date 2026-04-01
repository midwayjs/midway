import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  private users = [
    { id: 'u-1', name: 'harry', email: 'harry@example.com' },
    { id: 'u-2', name: 'tom', email: 'tom@example.com' },
  ];

  async getUsers() {
    return this.users;
  }

  async getUserById(id: string) {
    return this.users.find(user => user.id === id) || null;
  }
}
