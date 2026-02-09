export class Identifier {
  constructor(private value: number) {
    this.value = value;
  }

  equals(id?: Identifier): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof Identifier)) {
      return false;
    }
    return id.toValue() === this.value;
  }

  toString() {
    return String(this.value);
  }

  toValue(): number {
    return this.value;
  }
}
