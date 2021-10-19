import { close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Schema } from 'mongoose';
import { MongooseConnectionServiceFactory, MongooseConnectionService } from '../src';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

describe('/test/index.test.ts', () => {

  it('should connect mongodb', async () => {
    let app = await createLightApp(join(__dirname, 'fixtures', 'base-app'), {});
    const factory = await app.getApplicationContext().getAsync(MongooseConnectionServiceFactory);
    const conn = factory.get('default');
    const schema = new Schema<User>({
      name: { type: String, required: true },
      email: { type: String, required: true },
      avatar: String
    });
    const UserModel = conn.model<User>('User', schema);
    const doc = new UserModel({
      name: 'Bill',
      email: 'bill@initech.com',
      avatar: 'https://i.imgur.com/dM7Thhn.png'
    });
    await doc.save();
    console.log(doc.email);
    await close(app);
  });

  it('should connect mongodb with mongoose connection service', async () => {
    let app = await createLightApp(join(__dirname, 'fixtures', 'base-app'), {});
    const conn = await app.getApplicationContext().getAsync(MongooseConnectionService);
    const schema = new Schema<User>({
      name: { type: String, required: true },
      email: { type: String, required: true },
      avatar: String
    });
    const UserModel = conn.model<User>('User', schema);
    const doc = new UserModel({
      name: 'Bill',
      email: 'bill@initech.com',
      avatar: 'https://i.imgur.com/dM7Thhn.png'
    });
    await doc.save();
    console.log(doc.email);
    await close(app);
  });
});
