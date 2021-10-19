export const mongoose = {
  clients: {
    default: {
      uri: 'mongodb://localhost:27017',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "midway_test_db",
      }
    },
    db2: {
      uri: 'mongodb://localhost:27017',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "midway_test_db2",
      }
    }
  }
}
