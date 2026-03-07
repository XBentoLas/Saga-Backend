import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IAvailabilityTemplateGenerator } from '../../application/services/availability-template-generator.interface';

@Injectable()
export class ExcelAvailabilityTemplateService implements IAvailabilityTemplateGenerator {
  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Acadêmico';

    // --- PALETA DE CORES E ESTILOS ---
    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    }; // Azul Escuro
    const zebraDark: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    }; // Azul Claro
    const zebraLight: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' },
    }; // Branco

    const whiteFont: Partial<ExcelJS.Font> = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
    };
    const borderAll: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const booleanValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Sim,Não"'],
      showErrorMessage: true,
      errorTitle: 'Valor Inválido',
      error: 'Por favor, selecione Sim ou Não na lista.',
    };

    // ==========================================
    // ABA 1: PROFESSOR (NOVO LAYOUT 2 COLUNAS)
    // ==========================================
    const sheetProfessor = workbook.addWorksheet('Professor');
    // Apenas 2 colunas: A primeira para o Rótulo, a segunda para a Resposta
    sheetProfessor.columns = [{ width: 30 }, { width: 50 }];

    // --- Sessão 1: Dados Pessoais ---
    sheetProfessor.addRow(['DADOS DO PROFESSOR', '']);
    sheetProfessor.mergeCells('A1:B1');
    const header1 = sheetProfessor.getCell('A1');
    header1.fill = headerFill;
    header1.font = whiteFont;
    header1.alignment = { horizontal: 'center' };
    header1.border = borderAll;

    sheetProfessor.addRow(['Nome completo:', '']);
    sheetProfessor.addRow(['Email institucional:', '']);

    // --- Sessão 2: Disponibilidade ---
    sheetProfessor.addRow(['DISPONIBILIDADE POR TURNO', '']);
    sheetProfessor.mergeCells('A4:B4');
    const header2 = sheetProfessor.getCell('A4');
    header2.fill = headerFill;
    header2.font = whiteFont;
    header2.alignment = { horizontal: 'center' };
    header2.border = borderAll;

    sheetProfessor.addRow(['Matutino', 'Não']);
    sheetProfessor.addRow(['Vespertino', 'Não']);
    sheetProfessor.addRow(['Noturno', 'Não']);
    sheetProfessor.addRow(['EAD', 'Não']);

    // --- Aplicando Estilos (Zebrado e Bordas) na Aba Professor ---
    // Pinta as linhas de Dados Pessoais (Linhas 2 e 3)
    [2, 3].forEach((rowNum, idx) => {
      const isEven = idx % 2 === 0;
      const rowFill = isEven ? zebraLight : zebraDark;
      const row = sheetProfessor.getRow(rowNum);

      const cellA = row.getCell(1);
      cellA.fill = rowFill;
      cellA.font = { bold: true }; // Deixa "Nome:" e "Email:" em negrito
      cellA.border = borderAll;

      const cellB = row.getCell(2);
      cellB.fill = rowFill;
      cellB.border = borderAll;
    });

    // Pinta as linhas de Turnos (Linhas 5, 6, 7 e 8)
    [5, 6, 7, 8].forEach((rowNum, idx) => {
      const isEven = idx % 2 === 0;
      const rowFill = isEven ? zebraLight : zebraDark;
      const row = sheetProfessor.getRow(rowNum);

      const cellA = row.getCell(1);
      cellA.fill = rowFill;
      cellA.font = { bold: true };
      cellA.border = borderAll;

      const cellB = row.getCell(2);
      cellB.fill = rowFill;
      cellB.border = borderAll;
      cellB.dataValidation = booleanValidation; // Adiciona o dropdown Sim/Não
      cellB.alignment = { horizontal: 'center' };
    });

    // ==========================================
    // ABA 2: DISCIPLINAS
    // ==========================================
    const sheetDisciplinas = workbook.addWorksheet('Disciplinas');
    sheetDisciplinas.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Disciplina', key: 'disciplina', width: 60 },
    ];

    for (let c = 1; c <= 2; c++) {
      const cell = sheetDisciplinas.getCell(1, c);
      cell.fill = headerFill;
      cell.font = whiteFont;
      cell.border = borderAll;
      cell.alignment = { horizontal: 'center' };
    }

    for (let r = 2; r <= 21; r++) {
      const isEven = r % 2 === 0;
      const rowFill = isEven ? zebraLight : zebraDark;

      for (let c = 1; c <= 2; c++) {
        const cell = sheetDisciplinas.getCell(r, c);
        cell.fill = rowFill;
        cell.border = borderAll;
      }
    }

    // ==========================================
    // ABA 3: HORÁRIOS
    // ==========================================
    const sheetHorarios = workbook.addWorksheet('Horários');
    sheetHorarios.columns = [
      { header: 'Horário', key: 'horario', width: 20 },
      { header: 'Segunda', key: 'seg', width: 15 },
      { header: 'Terça', key: 'ter', width: 15 },
      { header: 'Quarta', key: 'qua', width: 15 },
      { header: 'Quinta', key: 'qui', width: 15 },
      { header: 'Sexta', key: 'sex', width: 15 },
      { header: 'Sábado', key: 'sab', width: 15 },
    ];

    for (let c = 1; c <= 7; c++) {
      const cell = sheetHorarios.getCell(1, c);
      cell.fill = headerFill;
      cell.font = whiteFont;
      cell.border = borderAll;
      cell.alignment = { horizontal: 'center' };
    }

    const horariosPadrao = [
      '07:30 - 09:10',
      '09:20 - 11:00',
      '13:00 - 14:40',
      '14:50 - 16:40',
      '16:30 - 18:10',
      '16:30 - 19:00',
      '16:50 - 18:10',
      '17:40 - 19:20',
      '19:30 - 21:10',
      '21:20 - 23:00',
    ];

    horariosPadrao.forEach((horario, index) => {
      const row = sheetHorarios.addRow({
        horario: horario,
        seg: 'Não',
        ter: 'Não',
        qua: 'Não',
        qui: 'Não',
        sex: 'Não',
        sab: 'Não',
      });

      const isEven = index % 2 === 0;
      const rowFill = isEven ? zebraLight : zebraDark;

      for (let c = 1; c <= 7; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = borderAll;
        cell.alignment = { horizontal: 'center' };

        if (c === 1) {
          cell.font = { bold: true };
        } else {
          cell.dataValidation = booleanValidation;
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
