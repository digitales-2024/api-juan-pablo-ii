/*
  Warnings:

  - The `cumpleanos` column on the `Paciente` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `fechaRegistro` on the `Paciente` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "cumpleanos",
ADD COLUMN     "cumpleanos" VARCHAR(20),
DROP COLUMN "fechaRegistro",
ADD COLUMN     "fechaRegistro" VARCHAR(20) NOT NULL;
