import { User } from '../user';
import { UserId } from '../identifier/user-id';

export abstract class IUserRepository {
  abstract save(user: User): Promise<void>;

  abstract findById(id: UserId): Promise<User | null>;

  abstract findByExternalId(externalId: string): Promise<User | null>;
}
