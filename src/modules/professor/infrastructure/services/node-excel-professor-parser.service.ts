import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  IExcelProfessorParser,
  ProfessorParsedData,
  HorarioParsedData,
} from '../../application/services/excel-professor-parser.interface';
import { DiaSemana, Turno } from '../../domain/enums';

@Injectable()
export class NodeExcelProfessorParserService implements IExcelProfessorParser {
  async parse(buffer: Buffer): Promise<ProfessorParsedData> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch {
      throw new BadRequestException(
        'Falha ao ler o arquivo. Certifique-se de que é um Excel válido (.xlsx).',
      );
    }

    const sheetProfessor = workbook.getWorksheet('Professor');
    const sheetDisciplinas = workbook.getWorksheet('Disciplinas');
    const sheetHorarios = workbook.getWorksheet('Horários');

    if (!sheetProfessor || !sheetDisciplinas || !sheetHorarios) {
      throw new BadRequestException(
        'Planilha inválida. As abas Professor, Disciplinas e Horários são obrigatórias.',
      );
    }

    const nome = sheetProfessor.getCell('B2').text.trim();
    const email = sheetProfessor.getCell('B3').text.trim();

    if (!nome || !email) {
      throw new BadRequestException(
        'Nome e Email do professor são obrigatórios na aba "Professor".',
      );
    }

    const disciplinasCodigos: string[] = [];
    sheetDisciplinas.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const codigo = row.getCell(1).text.trim();
        if (codigo) disciplinasCodigos.push(codigo);
      }
    });

    const horarios: HorarioParsedData[] = [];
    const diasMap = [
      { col: 2, dia: DiaSemana.SEGUNDA },
      { col: 3, dia: DiaSemana.TERCA },
      { col: 4, dia: DiaSemana.QUARTA },
      { col: 5, dia: DiaSemana.QUINTA },
      { col: 6, dia: DiaSemana.SEXTA },
      { col: 7, dia: DiaSemana.SABADO },
    ];

    sheetHorarios.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const horarioStr = row.getCell(1).text.trim(); // Ex: "07:30 - 09:10"

        if (horarioStr) {
          const { horaInicio, horaFim, turno } = this.parseHorarioString(
            horarioStr,
            rowNumber,
          );

          diasMap.forEach(({ col, dia }) => {
            const marcouSim =
              row.getCell(col).text.trim().toLowerCase() === 'sim';

            if (marcouSim) {
              horarios.push({ diaSemana: dia, turno, horaInicio, horaFim });
            }
          });
        }
      }
    });

    return { nome, email, disciplinasCodigos, horarios };
  }

  private parseHorarioString(
    horarioStr: string,
    linha: number,
  ): { horaInicio: Date; horaFim: Date; turno: Turno } {
    const regex = /^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/;
    const match = horarioStr.match(regex);

    if (!match) {
      throw new BadRequestException(
        `Formato de horário inválido na linha ${linha}: ${horarioStr}. Esperado: "HH:MM - HH:MM"`,
      );
    }

    const [_, hIni, mIni, hFim, mFim] = match;
    const horaIniNum = parseInt(hIni, 10);

    let turno: Turno;
    if (horaIniNum < 12) turno = Turno.MATUTINO;
    else if (horaIniNum < 18) turno = Turno.VESPERTINO;
    else turno = Turno.NOTURNO;

    const horaInicio = new Date(`1970-01-01T${hIni}:${mIni}:00Z`);
    const horaFim = new Date(`1970-01-01T${hFim}:${mFim}:00Z`);

    return { horaInicio, horaFim, turno };
  }
}
