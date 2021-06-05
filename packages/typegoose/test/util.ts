import { MongoMemoryServer } from 'mongodb-memory-server';

let instance;

export async function createMongoServer() {
  if (!process.env.MONGO_URI) {
    instance = new MongoMemoryServer();
    const uri = await instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  }
}

export async function closeMongoServer() {
  await instance.stop();
}
