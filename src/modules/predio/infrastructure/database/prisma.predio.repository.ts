import { Prisma, PrismaClient } from '@prisma/client';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { Predio } from '../../domain/predio';
import { PredioId } from '../../domain/identifier/predio-id';
import { DiaSemana, Turno } from '../../domain/enums';

// Definição do tipo de retorno do Prisma incluindo os 3 níveis
type PredioComSalas = Prisma.PredioGetPayload<{
  include: {
    salas: {
      include: {
        horarios: true;
      };
    };
  };
}>;

export class PrismaPredioRepository implements IPredioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(predio: Predio): Promise<void> {
    const rawId = predio.id.toValue();
    const dataPredio = { nome: predio.nome };

    // Separa salas novas das existentes para montar a query correta
    const salasNovas = predio.salas.filter((s) => s.id.toValue() === 0);
    const salasExistentes = predio.salas.filter((s) => s.id.toValue() !== 0);

    // Helper para mapear horários (usado tanto no create quanto no update de sala)
    const mapHorariosCreate = (horarios: any[]) =>
      horarios.map((h) => ({
        dia_semana: h.diaSemana as unknown as DiaSemana,
        turno: h.turno as unknown as Turno,
        hora_inicio: h.horaInicio,
        hora_fim: h.horaFim,
      }));

    await this.prisma.predio.upsert({
      where: { id_predio: rawId !== 0 ? rawId : -1 },

      // --- CRIAÇÃO (Novo Prédio) ---
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

      // --- ATUALIZAÇÃO (Prédio Existente) ---
      update: {
        ...dataPredio,
        salas: {
          // 1. Cria as salas que foram adicionadas no domínio (ID 0)
          create: salasNovas.map((sala) => ({
            numero_sala: sala.numeroSala,
            capacidade: sala.capacidade,
            tipo_sala: sala.tipoSala,
            horarios: {
              create: mapHorariosCreate(sala.horarios),
            },
          })),

          // 2. Atualiza as salas que já existem (ID > 0)
          update: salasExistentes.map((sala) => ({
            where: { id_sala: sala.id.toValue() },
            data: {
              numero_sala: sala.numeroSala,
              capacidade: sala.capacidade,
              tipo_sala: sala.tipoSala,
              // Estratégia para Horários da Sala: DeleteMany + Create
              // Seguro aqui pois HorarioSala não é referenciado externamente
              horarios: {
                deleteMany: {},
                create: mapHorariosCreate(sala.horarios),
              },
            },
          })),
        },
      },
    });
  }

  async findById(id: PredioId): Promise<Predio | null> {
    const prismaPredio = await this.prisma.predio.findUnique({
      where: { id_predio: id.toValue() },
      include: {
        salas: {
          include: {
            horarios: true, // Carrega o nível 3
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
    // Mapeamento recursivo: Predio -> Salas -> Horarios

    // O método restore do Predio espera a estrutura exata do banco
    // Mas precisa que os tipos (como Date e Enum) estejam alinhados
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
