import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddSalaCommand } from '../../../application/dtos/command/add-sala.command';

export class AddSalaRequest {
  @ApiProperty({
    example: 'O-221',
    description: 'Número identificador da sala (Letra-Número)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z]+-\d+$/, {
    message:
      'O número da sala deve seguir o padrão Letra-Número (ex: O-221, D-110)',
  })
  numeroSala: string;

  @ApiPropertyOptional({
    example: 40,
    description: 'Capacidade máxima de alunos',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidade?: number;

  @ApiPropertyOptional({
    example: 'Laboratório',
    description: 'Tipo de uso da sala',
  })
  @IsOptional()
  @IsString()
  tipoSala?: string;

  toCommand(predioId: number): AddSalaCommand {
    return {
      predioId,
      numeroSala: this.numeroSala,
      capacidade: this.capacidade,
      tipoSala: this.tipoSala,
    };
  }
}
