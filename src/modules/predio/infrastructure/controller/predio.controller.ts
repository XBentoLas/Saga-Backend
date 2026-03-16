import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { GetAllPrediosQueryOut } from '../../application/dtos/outputs/get-all-predios.query-out';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportSalasCsvUseCase } from '../../application/use-cases/import-salas-csv.use-case';
import { RemovePredioUseCase } from '../../application/use-cases/remove-predio.use-case';

@Controller('predios')
export class PredioController {
  constructor(
    private readonly createPredioUseCase: CreatePredioUseCase,
    private readonly addSalaUseCase: AddSalaUseCase,
    private readonly addHorarioSalaUseCase: AddHorarioSalaUseCase,
    private readonly removeSalaUseCase: RemoveSalaUseCase,
    private readonly removeHorarioSalaUseCase: RemoveHorarioSalaUseCase,
    private readonly getAllPrediosQueryHandler: GetAllPrediosQueryHandler,
    private readonly importSalasCsvUseCase: ImportSalasCsvUseCase,
    private readonly removePredioUseCase: RemovePredioUseCase,
  ) {}

  @Get()
  async getAll(): Promise<GetAllPrediosQueryOut[]> {
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

  @Post('importar-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importarCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser um .csv',
      );
    }

    await this.importSalasCsvUseCase.execute(file.buffer);

    return { message: 'Importação concluída com sucesso!' };
  }

  @Delete(':id')
  @HttpCode(204)
  async removePredio(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.removePredioUseCase.execute({ predioId: id });
  }
  @Delete(':predioId/salas/:salaId')
  @HttpCode(204)
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
