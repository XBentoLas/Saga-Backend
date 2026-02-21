import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { AddSalaCommand } from '../../../application/dtos/command/add-sala.command';

export class AddSalaRequest {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numeroSala: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidade?: number;

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
