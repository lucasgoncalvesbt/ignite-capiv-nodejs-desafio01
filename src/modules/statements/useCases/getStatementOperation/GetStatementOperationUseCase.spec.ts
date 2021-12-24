import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;


describe('Get Statement Operation', () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  })

  it('should be able get a statement operation', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: await hash('1234', 8),
    })

    const statement = await statementsRepositoryInMemory.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit of 100'
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(statementOperation).toHaveProperty('id');
  })

  it('should not be able get a statement operation if user not found', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'user.id',
        statement_id: 'statement.id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it('should not be able get a statement operation if statement not found', async () => {
    expect(async () => {

      const user = await usersRepositoryInMemory.create({
        name: 'John Doe',
        email: 'john@email.com',
        password: await hash('1234', 8),
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'statement.id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})
