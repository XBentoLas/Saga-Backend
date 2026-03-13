import { Injectable, BadRequestException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/repository/professor.repository.interface';
import { IDisciplinaRepository } from '../../../disciplina/domain/repository/disciplina.repository.interface';
import { IExcelProfessorParser } from '../ports/excel-professor-parser.interface';
import { ImportProfessorExcelCommand } from '../dtos/command/import-professor-excel.command';
import { Professor } from '../../domain/professor';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportProfessorExcelUseCase {
  constructor(
    private readonly professorRepository: IProfessorRepository,
    private readonly disciplinaRepository: IDisciplinaRepository,
    private readonly excelParser: IExcelProfessorParser,
    @InjectPinoLogger(ImportProfessorExcelUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ImportProfessorExcelCommand): Promise<void> {
    this.logger.info({ msg: 'Iniciando importação de excel do Professor' });

    const parsedData = await this.excelParser.parse(command.fileBuffer);

    const disciplinasValidas: number[] = [];
    const codigosNaoEncontrados: string[] = [];

    for (const codigo of parsedData.disciplinasCodigos) {
      const disciplina = await this.disciplinaRepository.findByCodigo(codigo);
      if (!disciplina) {
        codigosNaoEncontrados.push(codigo);
      } else {
        disciplinasValidas.push(disciplina.id.toValue());
      }
    }

    if (codigosNaoEncontrados.length > 0) {
      throw new BadRequestException(
        `As disciplinas a seguir não existem no sistema: ${codigosNaoEncontrados.join(', ')}. Corrija a planilha ou cadastre-as primeiro.`,
      );
    }

    try {
      let professor = await this.professorRepository.findByEmail(
        parsedData.email,
      );

      if (!professor) {
        professor = Professor.create({
          nome: parsedData.nome,
          email: parsedData.email,
        });
      } else {
        professor.updateNome(parsedData.nome);
        professor.limparDisciplinas();
        professor.limparHorarios();
      }

      for (const idDisciplina of disciplinasValidas) {
        professor.associarDisciplina(idDisciplina);
      }

      for (const h of parsedData.horarios) {
        professor.adicionarHorario({
          diaSemana: h.diaSemana,
          turno: h.turno,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim,
        });
      }

      await this.professorRepository.save(professor);
      this.logger.info({
        msg: 'Professor importado com sucesso',
        email: parsedData.email,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Erro ao persistir dados do professor',
        err: error as Error,
      });
      throw error;
    }
  }
}
