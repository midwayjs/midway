import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  // Mock user database
  private users = [
    { id: 1, name: 'Tom', email: 'zhangsan@example.com' },
    { id: 2, name: 'Jerry', email: 'lisi@example.com' },
    { id: 3, name: 'Kate', email: 'wangwu@example.com' },
  ];

  // List all users
  async getUsers() {
    return this.users;
  }

  // Get user by ID
  async getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  // Create user
  async createUser(name: string, email: string) {
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
    };
    this.users.push(newUser);
    return newUser;
  }

  // Update user
  async updateUser(id: number, data: { name?: string; email?: string }) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return null;
    }
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return user;
  }

  // Delete user
  async deleteUser(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }

  // Search users
  async searchUsers(keyword: string) {
    return this.users.filter(
      user =>
        user.name.includes(keyword) || user.email.includes(keyword)
    );
  }
}
