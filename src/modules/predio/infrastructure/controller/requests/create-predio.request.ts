import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CreatePredioCommand } from '../../../application/dtos/command/create-predio.command';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredioRequest {
  @ApiProperty({
    example: 'Predio delta',
    description: 'Delta',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  nome: string;

  toCommand(): CreatePredioCommand {
    return { nome: this.nome };
  }
}
