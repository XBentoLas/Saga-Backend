import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
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
import { ChangeStatusSalaUseCase } from '../../application/dtos/command/change-status-sala.use-case';

@ApiTags('Prédios')
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
    private readonly changeStatusSalaUseCase: ChangeStatusSalaUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os prédios com suas salas e horários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de prédios retornada com sucesso',
    type: [GetAllPrediosQueryOut],
  })
  async getAll(): Promise<GetAllPrediosQueryOut[]> {
    return this.getAllPrediosQueryHandler.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo prédio' })
  @ApiResponse({
    status: 201,
    description: 'Prédio criado com sucesso',
    type: PredioOutput,
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 409, description: 'Prédio com este nome já existe' })
  async create(@Body() request: CreatePredioRequest): Promise<PredioOutput> {
    return this.createPredioUseCase.execute(request.toCommand());
  }

  @Post(':predioId/salas')
  @ApiOperation({ summary: 'Adiciona uma nova sala a um prédio' })
  @ApiParam({ name: 'predioId', description: 'ID do prédio' })
  @ApiResponse({
    status: 201,
    description: 'Sala adicionada com sucesso',
    type: PredioOutput,
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  @ApiResponse({ status: 409, description: 'Sala com este número já existe neste prédio' })
  async addSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Body() request: AddSalaRequest,
  ): Promise<PredioOutput> {
    return this.addSalaUseCase.execute(request.toCommand(predioId));
  }

  @Post(':predioId/salas/:salaId/horarios')
  @ApiOperation({ summary: 'Adiciona um novo horário a uma sala' })
  @ApiParam({ name: 'predioId', description: 'ID do prédio' })
  @ApiParam({ name: 'salaId', description: 'ID da sala' })
  @ApiResponse({
    status: 201,
    description: 'Horário adicionado com sucesso',
    type: PredioOutput,
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Prédio ou sala não encontrados' })
  @ApiResponse({ status: 409, description: 'Conflito de horários' })
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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importa salas a partir de um arquivo CSV' })
  @ApiBody({
    description: 'Arquivo CSV para importar salas',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Importação concluída com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou dados incorretos' })
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

    try {
      await this.importSalasCsvUseCase.execute(file.buffer);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Falha ao importar o arquivo CSV. Verifique os dados e tente novamente.'
      );
    }

    return { message: 'Importação concluída com sucesso!' };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um prédio' })
  @ApiParam({ name: 'id', description: 'ID do prédio a ser removido' })
  @ApiResponse({ status: 204, description: 'Prédio removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async removePredio(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.removePredioUseCase.execute({ predioId: id });
  }

  @Delete(':predioId/salas/:salaId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma sala de um prédio' })
  @ApiParam({ name: 'predioId', description: 'ID do prédio' })
  @ApiParam({ name: 'salaId', description: 'ID da sala a ser removida' })
  @ApiResponse({ status: 204, description: 'Sala removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Prédio ou sala não encontrados' })
  async removeSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Param('salaId', ParseIntPipe) salaId: number,
  ): Promise<void> {
    return this.removeSalaUseCase.execute({ predioId, salaId });
  }

  @Delete(':predioId/salas/:salaId/horarios/:horarioId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um horário de uma sala' })
  @ApiParam({ name: 'predioId', description: 'ID do prédio' })
  @ApiParam({ name: 'salaId', description: 'ID da sala' })
  @ApiParam({ name: 'horarioId', description: 'ID do horário a ser removido' })
  @ApiResponse({ status: 204, description: 'Horário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Prédio, sala ou horário não encontrados' })
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

  @Patch(':predioId/salas/:salaId/status')
  @ApiOperation({ summary: 'Ativa ou desativa uma sala' })
  @ApiParam({ name: 'predioId', description: 'ID do prédio' })
  @ApiParam({ name: 'salaId', description: 'ID da sala' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          example: true,
          description: 'Define se a sala está ativa ou não',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status da sala alterado com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Prédio ou sala não encontrados' })
  async changeStatusSala(
    @Param('predioId', ParseIntPipe) predioId: number,
    @Param('salaId', ParseIntPipe) salaId: number,
    @Body('isActive') isActive: boolean,
  ): Promise<{ message: string }> {
    await this.changeStatusSalaUseCase.execute({ predioId, salaId, isActive });
    return {
      message: `Sala ${isActive ? 'ativada' : 'desativada'} com sucesso!`,
    };
  }
}
