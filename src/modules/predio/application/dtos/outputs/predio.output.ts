import { Predio } from '../../../domain/predio';
import { SalaOutput } from './sala.output';

export class PredioOutput {
  id: number;
  nome: string;
  salas: SalaOutput[];

  static fromDomain(predio: Predio): PredioOutput {
    return {
      id: predio.id.toValue(),
      nome: predio.nome,
      salas: predio.salas.map(SalaOutput.fromDomain),
    };
  }
}
