export class NumeroSalaVO {
  private readonly value: string;

  private static readonly regex = /^[A-Z]+-\d+$/i;

  private constructor(value: string) {
    this.value = value.toUpperCase();
  }

  public static create(value: string): NumeroSalaVO {
    if (!value || value.trim().length === 0) {
      throw new Error('O número da sala não pode ser vazio.');
    }

    if (!this.regex.test(value.trim())) {
      throw new Error(
        'Formato de sala inválido. O formato correto é Letra-Número (ex: O-221, D-110).',
      );
    }

    return new NumeroSalaVO(value.trim());
  }

  public toValue(): string {
    return this.value;
  }
}
