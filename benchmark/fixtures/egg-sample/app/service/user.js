'use strict';

const Service = require('egg').Service;

class UserService implements Service {

  async getUser(options) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: options.id,
          username: 'mockedName',
          phone: '12345678901',
          email: 'xxx.xxx@xxx.com',
        });
      }, 100);
    });
  }
}

module.exports = UserService;
