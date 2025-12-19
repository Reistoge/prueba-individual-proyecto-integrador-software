import { faker } from '@faker-js/faker';
import { CreateStudentDto } from '../../student/dto/create-student.dto';
import { promises as fs } from 'fs';
import * as path from 'path';

type Programa = { cod_programa: string; nombre_estandar: string };

const PROGRAMAS: Programa[] = [
  { cod_programa: 'INF', nombre_estandar: 'Ingeniería Informática' },
  { cod_programa: 'ADM', nombre_estandar: 'Administración de Empresas' },
  { cod_programa: 'CIV', nombre_estandar: 'Ingeniería Civil' },
  { cod_programa: 'MED', nombre_estandar: 'Medicina' },
  { cod_programa: 'DER', nombre_estandar: 'Derecho' },
];

function makeRut(): string {
  return `${faker.string.numeric({ length: 8 })}-${faker.string.numeric({ length: 1 })}`;
}

function makeCatalogo(year: number): string {
  return `CAT-${year}`;
}

function estadoMatriculado(): { cod_estado: string; nombre_estado: string } {
  return { cod_estado: 'M', nombre_estado: 'Matriculado' };
}

function estadoNoMatriculado(): { cod_estado: string; nombre_estado: string } {
  return { cod_estado: 'NM', nombre_estado: 'No Matriculado' };
}

// Build a realistic academic status history with controlled retention
function buildHistoryForStudent(retentionRate: number): CreateStudentDto[] {
  const rut = makeRut();
  const nombre = faker.person.fullName();
  const programa = faker.helpers.arrayElement(PROGRAMAS);
  const yearAdmision = faker.number.int({ min: 2015, max: 2023 }); // leave room for year+1
  const catalogo = makeCatalogo(yearAdmision);

  const records: CreateStudentDto[] = [];

  // Year 1: always matriculated (first enrollment)
  records.push({
    rut,
    nombre,
    year_admision: yearAdmision,
    cod_programa: programa.cod_programa,
    nombre_estandar: programa.nombre_estandar,
    catalogo,
    year_estado: yearAdmision,
    ...estadoMatriculado(),
  });

  // Year 2: retained or not based on retention rate
  const retained = Math.random() < retentionRate;
  
  if (retained) {
    // Student returns for year 2
    records.push({
      rut,
      nombre,
      year_admision: yearAdmision,
      cod_programa: programa.cod_programa,
      nombre_estandar: programa.nombre_estandar,
      catalogo,
      year_estado: yearAdmision + 1,
      ...estadoMatriculado(),
    });

    // Optional: add more years with varying patterns
    const additionalYears = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < additionalYears; i++) {
      const yearOffset = 2 + i;
      const stillEnrolled = Math.random() < 0.85; // 85% continue each subsequent year
      records.push({
        rut,
        nombre,
        year_admision: yearAdmision,
        cod_programa: programa.cod_programa,
        nombre_estandar: programa.nombre_estandar,
        catalogo,
        year_estado: yearAdmision + yearOffset,
        ...(stillEnrolled ? estadoMatriculado() : estadoNoMatriculado()),
      });
    }
  } else {
    // Chance
    // Student did NOT return for year 2 (dropout/not retained)
    // Optionally add a non-matriculated record or just omit year 2 entirely
    const addDropoutRecord = Math.random() < 0.3; // 30% chance to explicitly record dropout
    if (addDropoutRecord) {
      records.push({
        rut,
        nombre,
        year_admision: yearAdmision,
        cod_programa: programa.cod_programa,
        nombre_estandar: programa.nombre_estandar,
        catalogo,
        year_estado: yearAdmision + 1,
        ...estadoNoMatriculado(),
      });
    }
    // Otherwise, student simply has no year+1 record (implicit dropout)
  }

  return records;
}

async function generateJson(count: number, retentionRate: number, filename?: string) {
  const payload: CreateStudentDto[] = [];
  
  console.log(`Generating ${count} students with ${(retentionRate * 100).toFixed(0)}% retention rate...`);
  
  for (let i = 0; i < count; i++) {
    payload.push(...buildHistoryForStudent(retentionRate));
  }

  const outFile =
    filename && filename.trim().length > 0
      ? filename
      : `student-status.seed.${count}.${Math.round(retentionRate * 100)}.json`;

  const outPath = path.resolve(__dirname, outFile);
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  
  console.log(`✓ Wrote ${payload.length} records (${count} students) to: ${outPath}`);
}

(async () => {
  try {
    const countArg = parseInt(process.argv[2] || '100', 10);
    const rateArg = parseFloat(process.argv[3] || '0.75');
    const filenameArg = process.argv[4];

    const count = Number.isFinite(countArg) ? countArg : 100;
    const retentionRate = Number.isFinite(rateArg) ? Math.min(Math.max(rateArg, 0), 1) : 0.75;

    await generateJson(count, retentionRate, filenameArg);
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  }
})();