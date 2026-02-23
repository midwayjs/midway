import { Provide } from '@midwayjs/core';

type User = {
  id: string;
  name: string;
  email: string;
};

@Provide()
export class UserService {
  private users: User[] = [
    { id: 'u-1', name: 'harry', email: 'harry@example.com' },
    { id: 'u-2', name: 'tom', email: 'tom@example.com' },
  ];

  async getUsers() {
    return this.users;
  }

  async getUserById(id: string) {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(name: string, email: string) {
    const newUser = {
      id: `u-${this.users.length + 1}`,
      name,
      email,
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: { name?: string; email?: string }) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return user;
  }

  async deleteUser(id: string) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async searchUsers(keyword: string) {
    return this.users.filter(
      user => user.name.includes(keyword) || user.email.includes(keyword)
    );
  }
}
