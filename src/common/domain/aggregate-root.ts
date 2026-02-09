import { Entity } from './entity';
import { Identifier } from './identifier';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _version: number;

  // Definindo padrão de versão 0
  constructor(props: T, id: Identifier, version: number = 0) {
    super(props, id);
    this._version = version;
  }

  get version(): number {
    return this._version;
  }

  // Útil se você for implementar controle de concorrência no futuro
  protected incrementVersion(): void {
    this._version++;
  }
}
