import { Predio } from '../../../domain/predio';
import { SalaOutput } from './sala.output';
import { ApiProperty } from '@nestjs/swagger';

export class PredioOutput {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Delta' })
  nome: string;

  @ApiProperty({ type: () => [SalaOutput] })
  salas: SalaOutput[];

  static fromDomain(predio: Predio): PredioOutput {
    return {
      id: predio.id.toValue(),
      nome: predio.nome,
      salas: predio.salas.map(SalaOutput.fromDomain),
    };
  }
}
