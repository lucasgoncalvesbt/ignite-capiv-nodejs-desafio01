import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository

describe('Create User', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@email.com',
      password: '1234'
    });

    expect(user).toHaveProperty('id');
  })

  it('should  not be able to create a new user with an email existent', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234'
      });

      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234'
      });

    }).rejects.toBeInstanceOf(CreateUserError);
  })

})
