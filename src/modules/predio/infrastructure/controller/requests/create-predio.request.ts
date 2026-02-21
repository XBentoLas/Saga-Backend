import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CreatePredioCommand } from '../../../application/dtos/command/create-predio.command';

export class CreatePredioRequest {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  nome: string;

  toCommand(): CreatePredioCommand {
    return { nome: this.nome };
  }
}
