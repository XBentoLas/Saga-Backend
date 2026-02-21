-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MATUTINO', 'VESPERTINO', 'NOTURNO');

-- CreateTable
CREATE TABLE "predio" (
    "id_predio" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "predio_pkey" PRIMARY KEY ("id_predio")
);

-- CreateTable
CREATE TABLE "sala" (
    "id_sala" SERIAL NOT NULL,
    "id_predio" INTEGER NOT NULL,
    "numero_sala" INTEGER NOT NULL,
    "capacidade" INTEGER,
    "tipo_sala" TEXT,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id_sala")
);

-- CreateTable
CREATE TABLE "curso" (
    "id_curso" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo_curso" TEXT NOT NULL,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "disciplina" (
    "id_disciplina" SERIAL NOT NULL,
    "codigo_disciplina" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "disciplina_pkey" PRIMARY KEY ("id_disciplina")
);

-- CreateTable
CREATE TABLE "turma" (
    "id_turma" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "quantidade" INTEGER,
    "semestre" INTEGER NOT NULL,

    CONSTRAINT "turma_pkey" PRIMARY KEY ("id_turma")
);

-- CreateTable
CREATE TABLE "professor" (
    "id_professor" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id_professor")
);

-- CreateTable
CREATE TABLE "horario_professor" (
    "id_horario" SERIAL NOT NULL,
    "id_professor" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "turno" "Turno" NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fim" TIME NOT NULL,

    CONSTRAINT "horario_professor_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "horario_sala" (
    "id_horario" SERIAL NOT NULL,
    "id_sala" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "turno" "Turno" NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fim" TIME NOT NULL,

    CONSTRAINT "horario_sala_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "agendamento" (
    "id_agendamento" SERIAL NOT NULL,
    "id_professor" INTEGER NOT NULL,
    "id_turma" INTEGER NOT NULL,
    "id_sala" INTEGER NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fim" TIME NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,

    CONSTRAINT "agendamento_pkey" PRIMARY KEY ("id_agendamento")
);

-- CreateTable
CREATE TABLE "user" (
    "id_user" SERIAL NOT NULL,
    "id_external" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "_DisciplinaCurso" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DisciplinaCurso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DisciplinaProfessor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DisciplinaProfessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "curso_codigo_curso_key" ON "curso"("codigo_curso");

-- CreateIndex
CREATE UNIQUE INDEX "disciplina_codigo_disciplina_key" ON "disciplina"("codigo_disciplina");

-- CreateIndex
CREATE UNIQUE INDEX "professor_email_key" ON "professor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_external_key" ON "user"("id_external");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "_DisciplinaCurso_B_index" ON "_DisciplinaCurso"("B");

-- CreateIndex
CREATE INDEX "_DisciplinaProfessor_B_index" ON "_DisciplinaProfessor"("B");

-- AddForeignKey
ALTER TABLE "sala" ADD CONSTRAINT "sala_id_predio_fkey" FOREIGN KEY ("id_predio") REFERENCES "predio"("id_predio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turma" ADD CONSTRAINT "turma_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_professor" ADD CONSTRAINT "horario_professor_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professor"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_sala" ADD CONSTRAINT "horario_sala_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "sala"("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professor"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_turma_fkey" FOREIGN KEY ("id_turma") REFERENCES "turma"("id_turma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "sala"("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplinaCurso" ADD CONSTRAINT "_DisciplinaCurso_A_fkey" FOREIGN KEY ("A") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplinaCurso" ADD CONSTRAINT "_DisciplinaCurso_B_fkey" FOREIGN KEY ("B") REFERENCES "disciplina"("id_disciplina") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplinaProfessor" ADD CONSTRAINT "_DisciplinaProfessor_A_fkey" FOREIGN KEY ("A") REFERENCES "disciplina"("id_disciplina") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplinaProfessor" ADD CONSTRAINT "_DisciplinaProfessor_B_fkey" FOREIGN KEY ("B") REFERENCES "professor"("id_professor") ON DELETE CASCADE ON UPDATE CASCADE;
