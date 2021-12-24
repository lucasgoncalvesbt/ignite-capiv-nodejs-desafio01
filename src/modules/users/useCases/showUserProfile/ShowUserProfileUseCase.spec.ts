import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Show User Profile', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  })

  it('should be able to show an user profile', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: await hash('1234', 8),
    })

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile).toHaveProperty('id');
  });

  it('should not be able to show an user profile with invalid id', async () => {
    expect(async () => {
      const userProfile = await showUserProfileUseCase.execute('test');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})
