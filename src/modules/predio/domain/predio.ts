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

  // --- Factory: Create ---
  public static create(props: { nome: string }, id?: PredioId): Predio {
    return new Predio(
      {
        nome: props.nome,
        salas: [],
      },
      id,
    );
  }

  // --- Factory: Restore ---
  public static restore(
    props: {
      nome: string;
      // Estrutura aninhada vinda do Prisma (Predio -> Salas -> Horarios)
      salas?: {
        id_sala: number;
        numero_sala: number;
        capacidade: number | null;
        tipo_sala: string | null;
        horarios: any[]; // Passamos 'any' ou definimos a interface completa aqui
      }[];
    },
    id: PredioId,
  ): Predio {
    // Mapeia cada sala bruta para uma Entidade Sala usando o restore dela
    const salasDomain = (props.salas || []).map((s) =>
      Sala.restore(
        {
          numero_sala: s.numero_sala,
          capacidade: s.capacidade,
          tipo_sala: s.tipo_sala,
          horarios: s.horarios,
        },
        SalaId.create(s.id_sala),
      ),
    );

    return new Predio(
      {
        nome: props.nome,
        salas: salasDomain,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new Error('Nome do prédio inválido.');
    }
  }

  // --- Comportamentos ---

  public updateNome(nome: string): void {
    this.props.nome = nome;
    this.validate();
  }

  public adicionarSala(
    numeroSala: number,
    capacidade?: number,
    tipoSala?: string,
  ): void {
    // Verifica duplicidade de número de sala neste prédio
    const salaExiste = this.props.salas.some(
      (s) => s.numeroSala === numeroSala,
    );
    if (salaExiste) {
      throw new Error(`A sala número ${numeroSala} já existe neste prédio.`);
    }

    const novaSala = Sala.create({ numeroSala, capacidade, tipoSala });
    this.props.salas.push(novaSala);
  }

  public removerSala(idSala: number): void {
    this.props.salas = this.props.salas.filter(
      (s) => s.id.toValue() !== idSala,
    );
  }

  // Exemplo: Método para acessar uma sala específica e operar nela
  public getSala(idSala: number): Sala | undefined {
    return this.props.salas.find((s) => s.id.toValue() === idSala);
  }
}
