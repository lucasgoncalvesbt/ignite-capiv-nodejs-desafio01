import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from 'supertest';
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from '../../../../database'

let connection: Connection;
describe('Get Statement Operation', () => {

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

  it('should be able to get a statement operation', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const statementResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit 100',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statementResponse.body;

    const response = await request(app)
      .get('/api/v1/statements/'+id)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to get a statement operation with an invalid statement id', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
})
