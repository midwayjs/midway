import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  private users = [{ id: 'u-1', name: 'harry', email: 'harry@example.com' }];

  async getUserById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }

  async createUser(name: string, email: string) {
    const user = { id: `u-${this.users.length + 1}`, name, email };
    this.users.push(user);
    return user;
  }
}
