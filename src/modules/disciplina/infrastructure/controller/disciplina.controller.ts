import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ImportDisciplinaExcelUseCase } from '../../application/use-cases/import-disciplina-excel.use-case';
import { DeleteDisciplinaUseCase } from '../../application/use-cases/delete-disciplina.use-case';

@ApiTags('Disciplinas')
@Controller('disciplinas')
export class DisciplinaController {
  constructor(
    private readonly importExcelUseCase: ImportDisciplinaExcelUseCase,
    private readonly deleteUseCase: DeleteDisciplinaUseCase,
  ) {}

  @Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importa disciplinas a partir de uma planilha Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Planilha Excel (.xlsx) com os dados das disciplinas',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'O arquivo .xlsx a ser importado.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Disciplinas importadas com sucesso!',
  })
  @ApiResponse({
    status: 400,
    description:
      'Requisição inválida. Pode ser por arquivo não enviado, formato inválido ou dados incorretos na planilha.',
  })
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Arquivo Excel não enviado.');
    }

    const isExcel =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx');

    if (!isExcel) {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser um Excel (.xlsx).',
      );
    }

    try {
      await this.importExcelUseCase.execute({ fileBuffer: file.buffer });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Erro inesperado ao importar disciplinas.');
    }

    return { message: 'Disciplinas importadas com sucesso!' };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove uma disciplina' })
  @ApiParam({
    name: 'id',
    description: 'ID da disciplina a ser removida',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Disciplina removida com sucesso!',
  })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada.' })
  async deleteDisciplina(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ disciplinaId: id });
    return { message: 'Disciplina removida com sucesso!' };
  }
}
