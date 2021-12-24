import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let getBalanceUseCase: GetBalanceUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;


describe('Get Balance', () => {
  usersRepositoryInMemory = new InMemoryUsersRepository();
  statementsRepositoryInMemory = new InMemoryStatementsRepository();
  getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);

  it('should be able to get balance', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: await hash('1234', 8),
    })

    const result = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(result).toHaveProperty('balance');
    expect(result.balance).toBe(0);
  });

  it('should not be able to get balance if user not found', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'idInvalid',
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
