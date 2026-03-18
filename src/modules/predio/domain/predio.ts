import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { PredioId } from './identifier/predio-id';
import { Sala } from './sala';
import { SalaId } from './identifier/sala-id';

export interface PredioProps {
  nome: string;
  salas: Sala[];
}

export class Predio extends AggregateRoot<PredioProps> {
  constructor(props: PredioProps, id?: PredioId) {
    super(props, id ?? PredioId.newId());
    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): PredioId {
    return this._id as PredioId;
  }
  get nome(): string {
    return this.props.nome;
  }
  get salas(): Sala[] {
    return this.props.salas;
  }

  public static create(props: { nome: string }, id?: PredioId): Predio {
    return new Predio({ nome: props.nome, salas: [] }, id);
  }

  public static restore(
    props: {
      nome: string;
      salas?: {
        id_sala: number;
        numero_sala: number;
        capacidade: number | null;
        tipo_sala: string | null;
        is_active: boolean;
        horarios: any[];
      }[];
    },
    id: PredioId,
  ): Predio {
    const salasDomain = (props.salas || []).map((s) =>
      Sala.restore(
        {
          numero_sala: s.numero_sala,
          capacidade: s.capacidade,
          tipo_sala: s.tipo_sala,
          is_active: s.is_active,
          horarios: s.horarios,
        },
        SalaId.create(s.id_sala),
      ),
    );

    return new Predio({ nome: props.nome, salas: salasDomain }, id);
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new Error('Nome do prédio inválido.');
    }
  }

  public updateNome(nome: string): void {
    this.props.nome = nome;
    this.validate();
  }

  public adicionarSala(
    numeroSala: number,
    capacidade?: number,
    tipoSala?: string,
  ): void {
    const salaExiste = this.props.salas.some(
      (s) => s.numeroSala === numeroSala,
    );
    if (salaExiste)
      throw new Error(`A sala número ${numeroSala} já existe neste prédio.`);
    const novaSala = Sala.create({ numeroSala, capacidade, tipoSala });
    this.props.salas.push(novaSala);
  }

  public removerSala(idSala: number): void {
    this.props.salas = this.props.salas.filter(
      (s) => s.id.toValue() !== idSala,
    );
  }

  public getSala(idSala: number): Sala | undefined {
    return this.props.salas.find((s) => s.id.toValue() === idSala);
  }

  public alterarStatusSala(idSala: number, isActive: boolean): void {
    const sala = this.props.salas.find((s) => s.id.toValue() === idSala);
    if (!sala) throw new Error('Sala não encontrada neste prédio.');

    if (isActive) {
      sala.ativar();
    } else {
      sala.desativar();
    }
  }
}
