// module.exports 会覆盖 exports 的内容，无法检查

module.exports = {
  parent: {
    a: 1,
    b: 2
  }
};

exports.keys = 'demo';
