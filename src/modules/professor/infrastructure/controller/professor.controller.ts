import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { GenerateAvailabilityTemplateUseCase } from '../../application/use-cases/generate-availability-template.use-case';
import { ImportProfessorExcelUseCase } from '../../application/use-cases/import-professor-excel.use-case';
import { DeleteProfessorUseCase } from '../../application/use-cases/delete-professor.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@ApiTags('Professores')
@Controller('professores')
export class ProfessorController {
  constructor(
    private readonly generateTemplateUseCase: GenerateAvailabilityTemplateUseCase,
    private readonly importProfessorExcelUseCase: ImportProfessorExcelUseCase,
    private readonly deleteProfessorUseCase: DeleteProfessorUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os professores' })
  @ApiResponse({ status: 200, description: 'Professores listados com sucesso.' })
  async getAll() {
    return this.prisma.professor.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { disciplinas: true, horarios: true } } },
    });
  }

  @Get('template-disponibilidade')
  @ApiOperation({
    summary: 'Baixa o template de planilha para importação de disponibilidade',
  })
  @ApiResponse({
    status: 200,
    description: 'Template da planilha de disponibilidade retornado com sucesso.',
    headers: {
      'Content-Type': {
        description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename="Template_Disponibilidade.xlsx"',
      },
    },
  })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.generateTemplateUseCase.execute();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="Template_Disponibilidade.xlsx"',
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  @Post('importar-disponibilidade')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importa a disponibilidade de um professor via planilha Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Planilha Excel (.xlsx) com a disponibilidade do professor',
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
    description: 'Disponibilidade do professor importada com sucesso!',
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
      throw new BadRequestException('Arquivo não enviado.');
    }

    const isExcel =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx');

    if (!isExcel) {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser uma planilha Excel (.xlsx).',
      );
    }

    try {
      await this.importProfessorExcelUseCase.execute({
        fileBuffer: file.buffer,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        'Erro inesperado ao importar a disponibilidade.',
      );
    }

    return { message: 'Disponibilidade do professor importada com sucesso!' };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove um professor e sua disponibilidade' })
  @ApiParam({
    name: 'id',
    description: 'ID do professor a ser removido',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Professor removido com sucesso!',
  })
  @ApiResponse({ status: 404, description: 'Professor não encontrado.' })
  async deleteProfessor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteProfessorUseCase.execute({ professorId: id });
    return { message: 'Professor removido com sucesso!' };
  }
}
