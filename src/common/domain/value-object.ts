interface ValueObjectProps {
  [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }

    // Otimização: Comparação rasa (Shallow Compare)
    // Se seus Value Objects tiverem objetos aninhados complexos,
    // considere usar uma lib como 'lodash.isequal' ou manter a serialização.
    const keys1 = Object.keys(this.props);
    const keys2 = Object.keys(vo.props);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (this.props[key] !== vo.props[key]) {
        return false;
      }
    }

    return true;
  }
}
