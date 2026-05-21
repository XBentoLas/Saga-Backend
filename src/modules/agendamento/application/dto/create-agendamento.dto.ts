import { IsInt, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgendamentoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_professor: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_turma: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_sala: number;

  @ApiProperty({ enum: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'] })
  @IsString()
  dia_semana: string;

  @ApiProperty({ example: '08:00', description: 'Hora início no formato HH:MM' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_inicio: string;

  @ApiProperty({ example: '10:00', description: 'Hora fim no formato HH:MM' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_fim: string;
}
