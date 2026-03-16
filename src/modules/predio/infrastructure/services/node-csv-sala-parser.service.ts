import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { ICsvSalaParser } from '../../application/services/csv-sala-parser.interface';
import { SalaImportDto } from '../../application/dtos/command/sala-import.dto';

@Injectable()
export class NodeCsvSalaParserService implements ICsvSalaParser {
  async parse(buffer: Buffer): Promise<SalaImportDto[]> {
    try {
      const fileContent = buffer.toString('utf-8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return records.map((record: any, index: number) => {
        if (
          !record.Predio ||
          !record.Numero_Sala ||
          !record.Tipo_Sala ||
          !record.Capacidade
        ) {
          throw new Error(
            `Dados incompletos na linha ${index + 2}. Verifique se as colunas estão corretas.`,
          );
        }

        const numeroSala = Number(record.Numero_Sala);
        const capacidade = Number(record.Capacidade);

        // 👇 NOVO: Verifica se realmente digitaram números
        if (isNaN(numeroSala) || isNaN(capacidade)) {
          throw new Error(
            `Valores numéricos inválidos na linha ${index + 2} (Sala: ${record.Numero_Sala}).`,
          );
        }

        return {
          predio: record.Predio,
          numeroSala: numeroSala,
          tipoSala: record.Tipo_Sala,
          capacidade: capacidade,
        };
      });
    } catch (error: any) {
      throw new BadRequestException(`Falha ao processar CSV: ${error.message}`);
    }
  }
}
