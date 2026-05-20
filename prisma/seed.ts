import { PrismaClient, DiaSemana, Turno } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Prédios e Salas ──
  const predios = await Promise.all([
    prisma.predio.create({
      data: {
        nome: 'Bloco A - Engenharias',
        salas: {
          create: [
            { numero_sala: 'A-101', capacidade: 40, tipo_sala: 'Teórica' },
            { numero_sala: 'A-102', capacidade: 40, tipo_sala: 'Teórica' },
            { numero_sala: 'A-103', capacidade: 60, tipo_sala: 'Auditório' },
            { numero_sala: 'A-201', capacidade: 35, tipo_sala: 'Teórica' },
            { numero_sala: 'A-202', capacidade: 35, tipo_sala: 'Teórica' },
            { numero_sala: 'A-LAB1', capacidade: 30, tipo_sala: 'Laboratório' },
            { numero_sala: 'A-LAB2', capacidade: 25, tipo_sala: 'Laboratório' },
          ],
        },
      },
    }),
    prisma.predio.create({
      data: {
        nome: 'Bloco B - Humanas',
        salas: {
          create: [
            { numero_sala: 'B-101', capacidade: 50, tipo_sala: 'Teórica' },
            { numero_sala: 'B-102', capacidade: 50, tipo_sala: 'Teórica' },
            { numero_sala: 'B-103', capacidade: 45, tipo_sala: 'Teórica' },
            { numero_sala: 'B-201', capacidade: 40, tipo_sala: 'Teórica' },
            { numero_sala: 'B-202', capacidade: 40, tipo_sala: 'Teórica' },
            { numero_sala: 'B-AUD', capacidade: 80, tipo_sala: 'Auditório' },
          ],
        },
      },
    }),
    prisma.predio.create({
      data: {
        nome: 'Bloco C - Saúde',
        salas: {
          create: [
            { numero_sala: 'C-101', capacidade: 45, tipo_sala: 'Teórica' },
            { numero_sala: 'C-102', capacidade: 45, tipo_sala: 'Teórica' },
            { numero_sala: 'C-LAB-BIO', capacidade: 20, tipo_sala: 'Laboratório' },
            { numero_sala: 'C-LAB-QUI', capacidade: 20, tipo_sala: 'Laboratório' },
            { numero_sala: 'C-201', capacidade: 35, tipo_sala: 'Teórica' },
          ],
        },
      },
    }),
    prisma.predio.create({
      data: {
        nome: 'Bloco D - Tecnologia',
        salas: {
          create: [
            { numero_sala: 'D-101', capacidade: 40, tipo_sala: 'Teórica' },
            { numero_sala: 'D-LAB-INFO1', capacidade: 30, tipo_sala: 'Laboratório de Informática' },
            { numero_sala: 'D-LAB-INFO2', capacidade: 30, tipo_sala: 'Laboratório de Informática' },
            { numero_sala: 'D-LAB-INFO3', capacidade: 25, tipo_sala: 'Laboratório de Informática' },
            { numero_sala: 'D-201', capacidade: 50, tipo_sala: 'Teórica' },
            { numero_sala: 'D-202', capacidade: 35, tipo_sala: 'Teórica' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${predios.length} prédios criados`);

  // ── Cursos ──
  const cursos = await Promise.all([
    prisma.curso.create({ data: { nome: 'Ciência da Computação', codigo_curso: 'CC' } }),
    prisma.curso.create({ data: { nome: 'Engenharia Civil', codigo_curso: 'EC' } }),
    prisma.curso.create({ data: { nome: 'Administração', codigo_curso: 'ADM' } }),
    prisma.curso.create({ data: { nome: 'Direito', codigo_curso: 'DIR' } }),
    prisma.curso.create({ data: { nome: 'Enfermagem', codigo_curso: 'ENF' } }),
    prisma.curso.create({ data: { nome: 'Engenharia de Produção', codigo_curso: 'EP' } }),
    prisma.curso.create({ data: { nome: 'Psicologia', codigo_curso: 'PSI' } }),
    prisma.curso.create({ data: { nome: 'Sistemas de Informação', codigo_curso: 'SI' } }),
  ]);

  console.log(`✅ ${cursos.length} cursos criados`);

  // ── Disciplinas ──
  const disciplinas = await Promise.all([
    prisma.disciplina.create({ data: { nome: 'Cálculo I', codigo_disciplina: 'MAT101', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[1].id_curso }, { id_curso: cursos[5].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Cálculo II', codigo_disciplina: 'MAT201', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[1].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Álgebra Linear', codigo_disciplina: 'MAT102', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[5].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Física I', codigo_disciplina: 'FIS101', cursos: { connect: [{ id_curso: cursos[1].id_curso }, { id_curso: cursos[5].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Algoritmos e Estruturas de Dados', codigo_disciplina: 'CC101', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[7].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Programação Orientada a Objetos', codigo_disciplina: 'CC201', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[7].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Banco de Dados', codigo_disciplina: 'CC301', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[7].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Redes de Computadores', codigo_disciplina: 'CC401', cursos: { connect: [{ id_curso: cursos[0].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Engenharia de Software', codigo_disciplina: 'CC501', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[7].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Resistência dos Materiais', codigo_disciplina: 'EC201', cursos: { connect: [{ id_curso: cursos[1].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Mecânica dos Solos', codigo_disciplina: 'EC301', cursos: { connect: [{ id_curso: cursos[1].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Estruturas de Concreto', codigo_disciplina: 'EC401', cursos: { connect: [{ id_curso: cursos[1].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Gestão de Pessoas', codigo_disciplina: 'ADM101', cursos: { connect: [{ id_curso: cursos[2].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Marketing', codigo_disciplina: 'ADM201', cursos: { connect: [{ id_curso: cursos[2].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Contabilidade', codigo_disciplina: 'ADM301', cursos: { connect: [{ id_curso: cursos[2].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Finanças Corporativas', codigo_disciplina: 'ADM401', cursos: { connect: [{ id_curso: cursos[2].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Direito Constitucional', codigo_disciplina: 'DIR101', cursos: { connect: [{ id_curso: cursos[3].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Direito Civil', codigo_disciplina: 'DIR201', cursos: { connect: [{ id_curso: cursos[3].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Direito Penal', codigo_disciplina: 'DIR301', cursos: { connect: [{ id_curso: cursos[3].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Anatomia Humana', codigo_disciplina: 'ENF101', cursos: { connect: [{ id_curso: cursos[4].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Farmacologia', codigo_disciplina: 'ENF201', cursos: { connect: [{ id_curso: cursos[4].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Saúde Coletiva', codigo_disciplina: 'ENF301', cursos: { connect: [{ id_curso: cursos[4].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Pesquisa Operacional', codigo_disciplina: 'EP201', cursos: { connect: [{ id_curso: cursos[5].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Logística', codigo_disciplina: 'EP301', cursos: { connect: [{ id_curso: cursos[5].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Psicologia Social', codigo_disciplina: 'PSI101', cursos: { connect: [{ id_curso: cursos[6].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Psicologia do Desenvolvimento', codigo_disciplina: 'PSI201', cursos: { connect: [{ id_curso: cursos[6].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Neuropsicologia', codigo_disciplina: 'PSI301', cursos: { connect: [{ id_curso: cursos[6].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Inteligência Artificial', codigo_disciplina: 'CC601', cursos: { connect: [{ id_curso: cursos[0].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Sistemas Operacionais', codigo_disciplina: 'CC701', cursos: { connect: [{ id_curso: cursos[0].id_curso }, { id_curso: cursos[7].id_curso }] } } }),
    prisma.disciplina.create({ data: { nome: 'Gestão de Projetos', codigo_disciplina: 'SI301', cursos: { connect: [{ id_curso: cursos[7].id_curso }, { id_curso: cursos[2].id_curso }] } } }),
  ]);

  console.log(`✅ ${disciplinas.length} disciplinas criadas`);

  // ── Professores ──
  const professores = await Promise.all([
    prisma.professor.create({ data: { nome: 'Dr. Carlos Silva', email: 'carlos.silva@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[0].id_disciplina }, { id_disciplina: disciplinas[1].id_disciplina }, { id_disciplina: disciplinas[2].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Ana Oliveira', email: 'ana.oliveira@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[4].id_disciplina }, { id_disciplina: disciplinas[5].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Roberto Santos', email: 'roberto.santos@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[6].id_disciplina }, { id_disciplina: disciplinas[8].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Maria Fernandes', email: 'maria.fernandes@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[3].id_disciplina }, { id_disciplina: disciplinas[9].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Paulo Mendes', email: 'paulo.mendes@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[10].id_disciplina }, { id_disciplina: disciplinas[11].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Juliana Costa', email: 'juliana.costa@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[12].id_disciplina }, { id_disciplina: disciplinas[13].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Ricardo Almeida', email: 'ricardo.almeida@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[14].id_disciplina }, { id_disciplina: disciplinas[15].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Fernanda Lima', email: 'fernanda.lima@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[16].id_disciplina }, { id_disciplina: disciplinas[17].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Marcos Pereira', email: 'marcos.pereira@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[18].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Camila Rodrigues', email: 'camila.rodrigues@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[19].id_disciplina }, { id_disciplina: disciplinas[20].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. André Souza', email: 'andre.souza@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[21].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Patrícia Nunes', email: 'patricia.nunes@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[22].id_disciplina }, { id_disciplina: disciplinas[23].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Eduardo Martins', email: 'eduardo.martins@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[24].id_disciplina }, { id_disciplina: disciplinas[25].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Luciana Araújo', email: 'luciana.araujo@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[26].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dr. Fernando Vieira', email: 'fernando.vieira@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[27].id_disciplina }, { id_disciplina: disciplinas[28].id_disciplina }] } } }),
    prisma.professor.create({ data: { nome: 'Dra. Beatriz Cardoso', email: 'beatriz.cardoso@universidade.edu.br', disciplinas: { connect: [{ id_disciplina: disciplinas[29].id_disciplina }] } } }),
  ]);

  console.log(`✅ ${professores.length} professores criados`);

  // ── Turmas ──
  const turmaData: { codigo_turma: string; id_curso: number; turno: Turno; quantidade: number; semestre: number }[] = [
    // CC
    { codigo_turma: 'CC-1MA', id_curso: cursos[0].id_curso, turno: 'MATUTINO', quantidade: 40, semestre: 1 },
    { codigo_turma: 'CC-1NA', id_curso: cursos[0].id_curso, turno: 'NOTURNO', quantidade: 45, semestre: 1 },
    { codigo_turma: 'CC-3MA', id_curso: cursos[0].id_curso, turno: 'MATUTINO', quantidade: 35, semestre: 3 },
    { codigo_turma: 'CC-3NA', id_curso: cursos[0].id_curso, turno: 'NOTURNO', quantidade: 38, semestre: 3 },
    { codigo_turma: 'CC-5MA', id_curso: cursos[0].id_curso, turno: 'MATUTINO', quantidade: 30, semestre: 5 },
    { codigo_turma: 'CC-7NA', id_curso: cursos[0].id_curso, turno: 'NOTURNO', quantidade: 28, semestre: 7 },
    // EC
    { codigo_turma: 'EC-1NA', id_curso: cursos[1].id_curso, turno: 'NOTURNO', quantidade: 50, semestre: 1 },
    { codigo_turma: 'EC-3NA', id_curso: cursos[1].id_curso, turno: 'NOTURNO', quantidade: 42, semestre: 3 },
    { codigo_turma: 'EC-5NA', id_curso: cursos[1].id_curso, turno: 'NOTURNO', quantidade: 35, semestre: 5 },
    // ADM
    { codigo_turma: 'ADM-1NA', id_curso: cursos[2].id_curso, turno: 'NOTURNO', quantidade: 55, semestre: 1 },
    { codigo_turma: 'ADM-3NA', id_curso: cursos[2].id_curso, turno: 'NOTURNO', quantidade: 48, semestre: 3 },
    { codigo_turma: 'ADM-5MA', id_curso: cursos[2].id_curso, turno: 'MATUTINO', quantidade: 40, semestre: 5 },
    // DIR
    { codigo_turma: 'DIR-1MA', id_curso: cursos[3].id_curso, turno: 'MATUTINO', quantidade: 50, semestre: 1 },
    { codigo_turma: 'DIR-1NA', id_curso: cursos[3].id_curso, turno: 'NOTURNO', quantidade: 55, semestre: 1 },
    { codigo_turma: 'DIR-3NA', id_curso: cursos[3].id_curso, turno: 'NOTURNO', quantidade: 45, semestre: 3 },
    // ENF
    { codigo_turma: 'ENF-1MA', id_curso: cursos[4].id_curso, turno: 'MATUTINO', quantidade: 40, semestre: 1 },
    { codigo_turma: 'ENF-3MA', id_curso: cursos[4].id_curso, turno: 'MATUTINO', quantidade: 35, semestre: 3 },
    { codigo_turma: 'ENF-5VA', id_curso: cursos[4].id_curso, turno: 'VESPERTINO', quantidade: 30, semestre: 5 },
    // EP
    { codigo_turma: 'EP-1NA', id_curso: cursos[5].id_curso, turno: 'NOTURNO', quantidade: 45, semestre: 1 },
    { codigo_turma: 'EP-3NA', id_curso: cursos[5].id_curso, turno: 'NOTURNO', quantidade: 40, semestre: 3 },
    // PSI
    { codigo_turma: 'PSI-1MA', id_curso: cursos[6].id_curso, turno: 'MATUTINO', quantidade: 40, semestre: 1 },
    { codigo_turma: 'PSI-3VA', id_curso: cursos[6].id_curso, turno: 'VESPERTINO', quantidade: 35, semestre: 3 },
    { codigo_turma: 'PSI-5MA', id_curso: cursos[6].id_curso, turno: 'MATUTINO', quantidade: 30, semestre: 5 },
    // SI
    { codigo_turma: 'SI-1NA', id_curso: cursos[7].id_curso, turno: 'NOTURNO', quantidade: 50, semestre: 1 },
    { codigo_turma: 'SI-3NA', id_curso: cursos[7].id_curso, turno: 'NOTURNO', quantidade: 42, semestre: 3 },
    { codigo_turma: 'SI-5NA', id_curso: cursos[7].id_curso, turno: 'NOTURNO', quantidade: 35, semestre: 5 },
  ];

  const turmas = await Promise.all(
    turmaData.map((t) => prisma.turma.create({ data: t })),
  );

  console.log(`✅ ${turmas.length} turmas criadas`);

  // ── Horários dos Professores (disponibilidade) ──
  const dias: DiaSemana[] = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'];
  const horarios = [
    { turno: 'MATUTINO' as Turno, hora_inicio: '1970-01-01T08:00:00.000Z', hora_fim: '1970-01-01T12:00:00.000Z' },
    { turno: 'VESPERTINO' as Turno, hora_inicio: '1970-01-01T13:00:00.000Z', hora_fim: '1970-01-01T17:30:00.000Z' },
    { turno: 'NOTURNO' as Turno, hora_inicio: '1970-01-01T19:00:00.000Z', hora_fim: '1970-01-01T22:30:00.000Z' },
  ];

  const horarioProfs: { id_professor: number; dia_semana: DiaSemana; turno: Turno; hora_inicio: Date; hora_fim: Date }[] = [];

  for (const prof of professores) {
    // Each professor available 3 random days, 1–2 turnos
    const selectedDias = dias.sort(() => Math.random() - 0.5).slice(0, 3);
    const selectedHorarios = horarios.sort(() => Math.random() - 0.5).slice(0, 2);

    for (const dia of selectedDias) {
      for (const h of selectedHorarios) {
        horarioProfs.push({
          id_professor: prof.id_professor,
          dia_semana: dia,
          turno: h.turno,
          hora_inicio: new Date(h.hora_inicio),
          hora_fim: new Date(h.hora_fim),
        });
      }
    }
  }

  await prisma.horarioProfessor.createMany({ data: horarioProfs });
  console.log(`✅ ${horarioProfs.length} horários de disponibilidade criados`);

  // ── Resumo ──
  const counts = {
    predios: await prisma.predio.count(),
    salas: await prisma.sala.count(),
    cursos: await prisma.curso.count(),
    disciplinas: await prisma.disciplina.count(),
    turmas: await prisma.turma.count(),
    professores: await prisma.professor.count(),
    horariosProfessor: await prisma.horarioProfessor.count(),
  };

  console.log('\n📊 Resumo final:');
  console.table(counts);
  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
