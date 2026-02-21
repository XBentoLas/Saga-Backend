import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { Predio } from '../../domain/predio';
import { PredioId } from '../../domain/identifier/predio-id';
import { DiaSemana, Turno } from '../../domain/enums';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

type PredioComSalas = Prisma.PredioGetPayload<{
  include: {
    salas: {
      include: {
        horarios: true;
      };
    };
  };
}>;

@Injectable() // <--- CORREÇÃO 1: Adicionado Injectable
export class PrismaPredioRepository implements IPredioRepository {
  // <--- CORREÇÃO 2: Injetando PrismaService ao invés de PrismaClient puro
  constructor(private readonly prisma: PrismaService) {}

  async save(predio: Predio): Promise<void> {
    const rawId = predio.id.toValue();
    const dataPredio = { nome: predio.nome };

    const salasNovas = predio.salas.filter((s) => s.id.toValue() === 0);
    const salasExistentes = predio.salas.filter((s) => s.id.toValue() !== 0);
    const idsSalasAtuais = salasExistentes.map((s) => s.id.toValue());

    const mapHorariosCreate = (horarios: any[]) =>
      horarios.map((h) => ({
        dia_semana: h.diaSemana as unknown as DiaSemana,
        turno: h.turno as unknown as Turno,
        hora_inicio: h.horaInicio,
        hora_fim: h.horaFim,
      }));

    await this.prisma.$transaction(async (tx) => {
      // 1. Remove salas que não existem mais no agregado
      if (rawId !== 0) {
        await tx.sala.deleteMany({
          where: {
            id_predio: rawId,
            id_sala: { notIn: idsSalasAtuais },
          },
        });
      }

      // 2. Upsert do Prédio e Salas
      await tx.predio.upsert({
        where: { id_predio: rawId !== 0 ? rawId : -1 },
        create: {
          ...dataPredio,
          salas: {
            create: predio.salas.map((sala) => ({
              numero_sala: sala.numeroSala,
              capacidade: sala.capacidade,
              tipo_sala: sala.tipoSala,
              horarios: {
                create: mapHorariosCreate(sala.horarios),
              },
            })),
          },
        },
        update: {
          ...dataPredio,
          salas: {
            create: salasNovas.map((sala) => ({
              numero_sala: sala.numeroSala,
              capacidade: sala.capacidade,
              tipo_sala: sala.tipoSala,
              horarios: {
                create: mapHorariosCreate(sala.horarios),
              },
            })),
            update: salasExistentes.map((sala) => ({
              where: { id_sala: sala.id.toValue() },
              data: {
                numero_sala: sala.numeroSala,
                capacidade: sala.capacidade,
                tipo_sala: sala.tipoSala,
                horarios: {
                  deleteMany: {},
                  create: mapHorariosCreate(sala.horarios),
                },
              },
            })),
          },
        },
      });
    });
  }

  async findById(id: PredioId): Promise<Predio | null> {
    const prismaPredio = await this.prisma.predio.findUnique({
      where: { id_predio: id.toValue() },
      include: {
        salas: {
          include: {
            horarios: true,
          },
        },
      },
    });

    if (!prismaPredio) return null;
    return this.toDomain(prismaPredio);
  }

  async findAll(): Promise<Predio[]> {
    const prismaPredios = await this.prisma.predio.findMany({
      include: {
        salas: {
          include: {
            horarios: true,
          },
        },
      },
    });

    return prismaPredios.map((p) => this.toDomain(p));
  }

  private toDomain(prismaData: PredioComSalas): Predio {
    const salasMapped = prismaData.salas.map((s) => ({
      id_sala: s.id_sala,
      numero_sala: s.numero_sala,
      capacidade: s.capacidade,
      tipo_sala: s.tipo_sala,
      horarios: s.horarios.map((h) => ({
        id_horario: h.id_horario,
        dia_semana: h.dia_semana as string,
        turno: h.turno as string,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
      })),
    }));

    return Predio.restore(
      {
        nome: prismaData.nome,
        salas: salasMapped,
      },
      PredioId.create(prismaData.id_predio),
    );
  }
}
