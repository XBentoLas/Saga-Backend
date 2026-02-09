import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { UserId } from './identifier/user-id';

export interface UserProps {
  nome: string;
  email: string;
  idExternal?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class User extends AggregateRoot<UserProps> {
  constructor(props: UserProps, id?: UserId) {
    super(props, id ?? UserId.newId());
    this.validate();
  }

  get id(): UserId {
    return this._id as UserId;
  }

  public static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'isActive'>,
    id?: UserId,
  ): User {
    const user = new User(
      {
        ...props,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );

    return user;
  }

  public static restore(
    props: {
      nome: string;
      email: string;
      idExternal?: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    id: UserId,
  ): User {
    return new User(
      {
        nome: props.nome,
        email: props.email,
        idExternal: props.idExternal,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new Error('O nome do usuário é inválido ou muito curto.');
    }

    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('O email fornecido é inválido.');
    }
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get idExternal(): string | null | undefined {
    return this.props.idExternal;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateName(newName: string): void {
    this.props.nome = newName;
    this.props.updatedAt = new Date();
    this.validate();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
}
