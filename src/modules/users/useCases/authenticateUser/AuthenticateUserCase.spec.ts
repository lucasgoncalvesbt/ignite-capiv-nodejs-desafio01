import { AppError } from "@shared/errors/AppError";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let userRepositoryInMemory: InMemoryUsersRepository;

describe('Authenticate User', () => {

  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepositoryInMemory);
  })

  it('should be able to authenticate an user', async () => {
    await userRepositoryInMemory.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: await hash('1234', 8),
    })

    const result = await authenticateUserUseCase.execute({
      email: 'john@email.com',
      password: '1234',
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate with an non existent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'testeErrado@email.com',
        password: 'user.password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with incorrect password', () => {
    expect(async () => {
      const user = await userRepositoryInMemory.create({
        name: 'John Doe',
        email: 'john@email.com',
        password: await hash('1234', 8),
      })

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'senhaIncorreta',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
