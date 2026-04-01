import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  // Mock user database
  private users = [
    { id: 1, name: 'Tom', email: 'zhangsan@example.com', age: 20 },
    { id: 2, name: 'Jerry', email: 'lisi@example.com', age: 25 },
    { id: 3, name: 'Kate', email: 'wangwu@example.com', age: 30 },
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
  async createUser(name: string, email: string, age?: number) {
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
      age,
    };
    this.users.push(newUser);
    return newUser;
  }

  // Update user
  async updateUser(id: number, data: { name?: string; email?: string; age?: number }) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return null;
    }
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (typeof data.age === 'number') user.age = data.age;
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
      user => user.name.includes(keyword) || user.email.includes(keyword)
    );
  }
}
