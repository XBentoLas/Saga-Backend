import { Identifier } from './identifier';

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export abstract class Entity<T> {
  protected readonly _id: Identifier;
  public readonly props: T;

  constructor(props: T, id: Identifier) {
    this._id = id;
    this.props = props;
  }

  get id(): Identifier {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
