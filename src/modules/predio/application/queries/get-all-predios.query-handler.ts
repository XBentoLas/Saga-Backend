import { Injectable } from '@nestjs/common';
import { PredioOutput } from '../dtos/outputs/predio.output';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class GetAllPrediosQueryHandler {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(GetAllPrediosQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(): Promise<PredioOutput[]> {
    this.logger.info({ msg: 'Listando todos os prédios' });

    const predios = await this.prisma.predio.findMany({
      include: {
        salas: {
          include: {
            horarios: true,
          },
        },
      },
    });

    return predios.map((p) => ({
      id: p.id_predio,
      nome: p.nome,
      salas: p.salas.map((s) => ({
        id: s.id_sala,
        numeroSala: s.numero_sala,
        capacidade: s.capacidade,
        tipoSala: s.tipo_sala,
        horarios: s.horarios.map((h) => ({
          id: h.id_horario,
          diaSemana: h.dia_semana,
          turno: h.turno,
          horaInicio: h.hora_inicio,
          horaFim: h.hora_fim,
        })),
      })),
    }));
  }
}
