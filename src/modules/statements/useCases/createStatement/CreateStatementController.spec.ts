import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from 'supertest';
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from '../../../../database'

let connection: Connection;
describe('Create Statement Controller', () => {

  beforeAll( async () => {
    connection =  await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('123456', 8);

    await connection.query(`
    INSERT INTO users (id, name, email, password, created_at, updated_at)
    VALUES ('${id}', 'user', 'user@finapi.com.br', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new deposit statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit 100',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should be able to create a new withdraw statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'withdraw 100',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new withdraw statement if have insufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'withdraw 100',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
})
