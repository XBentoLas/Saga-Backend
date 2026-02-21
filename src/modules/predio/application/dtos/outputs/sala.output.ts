import { Sala } from '../../../domain/sala';
import { HorarioSalaOutput } from './horario-sala.output';

export class SalaOutput {
  id: number;
  numeroSala: number;
  capacidade: number | null;
  tipoSala: string | null;
  horarios: HorarioSalaOutput[];

  static fromDomain(sala: Sala): SalaOutput {
    return {
      id: sala.id.toValue(),
      numeroSala: sala.numeroSala,
      capacidade: sala.capacidade,
      tipoSala: sala.tipoSala,
      horarios: sala.horarios.map(HorarioSalaOutput.fromDomain),
    };
  }
}
