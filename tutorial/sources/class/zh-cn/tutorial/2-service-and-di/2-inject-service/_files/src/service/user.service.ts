import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  // 模拟用户数据库
  private users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ];

  // 获取所有用户
  async getUsers() {
    return this.users;
  }

  // 根据 ID 获取用户
  async getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  // 创建新用户
  async createUser(name: string, email: string) {
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
    };
    this.users.push(newUser);
    return newUser;
  }

  // 更新用户信息
  async updateUser(id: number, data: { name?: string; email?: string }) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return null;
    }
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return user;
  }

  // 删除用户
  async deleteUser(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }

  // 搜索用户
  async searchUsers(keyword: string) {
    return this.users.filter(
      user =>
        user.name.includes(keyword) || user.email.includes(keyword)
    );
  }
}
