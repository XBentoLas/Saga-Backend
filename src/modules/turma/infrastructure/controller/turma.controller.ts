import {
  Controller,
  Get,
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
import { ImportTurmaExcelUseCase } from '../../application/use-cases/import-turma-excel.use-case';
import { DeleteTurmaUseCase } from '../../application/use-cases/delete-turma.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmaController {
  constructor(
    private readonly importExcelUseCase: ImportTurmaExcelUseCase,
    private readonly deleteUseCase: DeleteTurmaUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as turmas' })
  @ApiResponse({ status: 200, description: 'Turmas listadas com sucesso.' })
  async getAll() {
    return this.prisma.turma.findMany({
      orderBy: { codigo_turma: 'asc' },
      include: { curso: { select: { nome: true } } },
    });
  }

  @Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importa turmas a partir de uma planilha Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Planilha Excel (.xlsx) com os dados das turmas',
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
  @ApiResponse({ status: 201, description: 'Turmas importadas com sucesso!' })
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
      throw new BadRequestException('Erro inesperado ao importar turmas.');
    }

    return { message: 'Turmas importadas com sucesso!' };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove uma turma' })
  @ApiParam({
    name: 'id',
    description: 'ID da turma a ser removida',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Turma removida com sucesso!' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  async deleteTurma(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ turmaId: id });
    return { message: 'Turma removida com sucesso!' };
  }
}
