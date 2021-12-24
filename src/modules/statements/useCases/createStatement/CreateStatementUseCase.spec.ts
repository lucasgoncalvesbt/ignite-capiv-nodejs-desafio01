import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe('Create Statement', () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  })

  it('should be able to create a new statement', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: await hash('1234', 8),
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit of 100'
    });

    expect(statement).toHaveProperty('id');
  })

  it('should not be able to create a new statement if user not found', async () => {

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'idInvalid',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit of 100'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to create a new statement if have insufficient funds', async () => {

    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: 'John Doe',
        email: 'john@email.com',
        password: await hash('1234', 8),
      })

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'Deposit of 100'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})
