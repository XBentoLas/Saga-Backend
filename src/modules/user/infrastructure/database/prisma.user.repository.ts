import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/user';
import { IUserRepository } from '../../domain/repository/user.repository.interface';
import { UserId } from '../../domain/identifier/user-id';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const rawId = user.id.toValue();

    // Mapeamento dos dados da Entidade para o Banco (snake_case)
    const dataUser = {
      nome: user.nome,
      email: user.email,
      id_external: user.idExternal, // Opcional
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    await this.prisma.user.upsert({
      where: { id_user: rawId !== 0 ? rawId : -1 },

      // --- CRIAÇÃO ---
      create: {
        ...dataUser,
      },

      // --- ATUALIZAÇÃO ---
      update: {
        ...dataUser,
      },
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id_user: id.toValue() },
    });

    if (!prismaUser) return null;

    return this.toDomain(prismaUser);
  }

  async findByExternalId(externalId: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id_external: externalId },
    });

    if (!prismaUser) return null;

    return this.toDomain(prismaUser);
  }

  /**
   * Converte o objeto do Prisma (ORM) para a Entidade de Domínio (DDD)
   * Utiliza o método estático 'restore' da classe User.
   */
  private toDomain(prismaData: PrismaUser): User {
    return User.restore(
      {
        nome: prismaData.nome,
        email: prismaData.email,
        idExternal: prismaData.id_external,
        isActive: prismaData.is_active,
        createdAt: prismaData.created_at,
        updatedAt: prismaData.updated_at,
      },
      UserId.create(prismaData.id_user),
    );
  }
}
