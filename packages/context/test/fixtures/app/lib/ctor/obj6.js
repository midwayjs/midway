let i = 0;
module.exports = {
  getData() {
    const now = Date.now();
    const index = i++;
    return {
      now,
      index
    }
  }
}