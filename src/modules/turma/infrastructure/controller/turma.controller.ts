import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportTurmaCsvUseCase } from '../../application/use-cases/import-turma-csv.use-case';
import { DeleteTurmaUseCase } from '../../application/use-cases/delete-turma.use-case';

@Controller('turmas')
export class TurmaController {
  constructor(
    private readonly importCsvUseCase: ImportTurmaCsvUseCase,
    private readonly deleteUseCase: DeleteTurmaUseCase,
  ) {}

  @Post('importar-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importarCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Ficheiro CSV não enviado.');
    }

    if (!file.originalname.endsWith('.csv') && file.mimetype !== 'text/csv') {
      throw new BadRequestException(
        'Formato inválido. O ficheiro deve ser um CSV (.csv).',
      );
    }

    try {
      await this.importCsvUseCase.execute({ fileBuffer: file.buffer });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Erro inesperado ao importar turmas.');
    }

    return { message: 'Turmas importadas com sucesso!' };
  }

  @Delete(':id')
  async deleteTurma(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ turmaId: id });
    return { message: 'Turma removida com sucesso!' };
  }
}
