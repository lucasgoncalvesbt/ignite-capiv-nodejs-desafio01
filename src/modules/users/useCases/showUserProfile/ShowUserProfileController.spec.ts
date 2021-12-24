import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from 'supertest';
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from '../../../../database'

let connection: Connection;
describe('Show User Profile Controller', () => {

  beforeAll( async () => {
    connection =  await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('123456', 8);

    await connection.query(`
    INSERT INTO users (id, name, email, password, created_at, updated_at)
    VALUES ('${id}', 'user2', 'user2@finapi.com.br', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show an user profile', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user2@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to show an user profile with invalid token', async () => {

    const token = 'invalidToken';

    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });

})
