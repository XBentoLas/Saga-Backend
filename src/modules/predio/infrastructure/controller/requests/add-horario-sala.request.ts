import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { AddHorarioSalaCommand } from '../../../application/dtos/command/add-horario-sala.command';
import { DiaSemana, Turno } from '../../../domain/enums';

export class AddHorarioSalaRequest {
  @IsNotEmpty()
  @IsEnum(DiaSemana)
  diaSemana: DiaSemana;

  @IsNotEmpty()
  @IsEnum(Turno)
  turno: Turno;

  @IsNotEmpty()
  @IsDateString()
  horaInicio: string;

  @IsNotEmpty()
  @IsDateString()
  horaFim: string;

  toCommand(predioId: number, salaId: number): AddHorarioSalaCommand {
    return {
      predioId,
      salaId,
      diaSemana: this.diaSemana,
      turno: this.turno,
      horaInicio: new Date(this.horaInicio),
      horaFim: new Date(this.horaFim),
    };
  }
}
