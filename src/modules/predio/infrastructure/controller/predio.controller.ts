import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreatePredioUseCase } from '../../application/use-cases/create-predio.use-case';
import { AddSalaUseCase } from '../../application/use-cases/add-sala.use-case';
import { AddHorarioSalaUseCase } from '../../application/use-cases/add-horario-sala.use-case';
import { RemoveSalaUseCase } from '../../application/use-cases/remove-sala.use-case';
import { RemoveHorarioSalaUseCase } from '../../application/use-cases/remove-horario-sala.use-case';

import { GetAllPrediosQueryHandler } from '../../application/queries/get-all-predios.query-handler';
import { CreatePredioRequest } from './requests/create-predio.request';
import { AddSalaRequest } from './requests/add-sala.request';
import { AddHorarioSalaRequest } from './requests/add-horario-sala.request';
import { PredioOutput } from '../../application/dtos/outputs/predio.output';

@Controller('predios')
export class PredioController {
  constructor(
    private readonly createPredioUseCase: CreatePredioUseCase,
    private readonly addSalaUseCase: AddSalaUseCase,
    private readonly addHorarioSalaUseCase: AddHorarioSalaUseCase,
    private readonly removeSalaUseCase: RemoveSalaUseCase,
    private readonly removeHorarioSalaUseCase: RemoveHorarioSalaUseCase,
    private readonly getAllPrediosQueryHandler: GetAllPrediosQueryHandler,
  ) {}

  @Get()
  async getAll(): Promise<PredioOutput[]> {
    return this.getAllPrediosQueryHandler.execute();
  }

  @Post()
  async create(@Body() request: CreatePredioRequest): Promise<PredioOutput> {
    return this.createPredioUseCase.execute(request.toCommand());
  }

  @Post(':predioId/salas')
  async addSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Body() request: AddSalaRequest,
  ): Promise<PredioOutput> {
    return this.addSalaUseCase.execute(request.toCommand(predioId));
  }

  @Post(':predioId/salas/:salaId/horarios')
  async addHorarioSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Param('salaId', ParseIntPipe) salaId: number,
    @Body() request: AddHorarioSalaRequest,
  ): Promise<PredioOutput> {
    return this.addHorarioSalaUseCase.execute(
      request.toCommand(predioId, salaId),
    );
  }

  @Delete(':predioId/salas/:salaId')
  @HttpCode(204) // Retorna "No Content" quando deleta com sucesso
  async removeSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Param('salaId', ParseIntPipe) salaId: number,
  ): Promise<void> {
    return this.removeSalaUseCase.execute({ predioId, salaId });
  }

  @Delete(':predioId/salas/:salaId/horarios/:horarioId')
  @HttpCode(204)
  async removeHorarioSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Param('salaId', ParseIntPipe) salaId: number,
    @Param('horarioId', ParseIntPipe) horarioId: number,
  ): Promise<void> {
    return this.removeHorarioSalaUseCase.execute({
      predioId,
      salaId,
      horarioId,
    });
  }
}
