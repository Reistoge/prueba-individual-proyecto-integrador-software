import { Injectable } from '@nestjs/common';
import { StudentService } from 'src/student/student.service';
import { StudentAcademicStatus } from 'src/student/entities/student-academic-status.schema';
import { CarreraResponseDto } from './dto/carrera-response.dto';
import { RetencionResponseDto } from './dto/retencion-response.dto';
import { StudentFilters } from 'src/student/repositories/student.repository.interface';

// Nota: Podemos usar StudentFilters en lugar de definir RetentionFilters localmente

@Injectable()
export class RetencionService {

  constructor(
    private readonly studentService: StudentService
  ) { }

  private isMatriculado(s: StudentAcademicStatus) {
    return s.cod_estado === 'M';
  }

  async obtenerCarreras(): Promise<CarreraResponseDto[]> {
    // Obtenemos todo (sin filtros, por defecto de BD)
    const status = await this.studentService.findAll();
    return this.agruparCarreras(status);
  }

  async obtenerResumen(filters?: StudentFilters, filename?: string): Promise<RetencionResponseDto[]> {
    // Delegamos la obtención de datos al orquestador
    const status = await this.studentService.findAll(filters, filename);
    return this.calcularRetencion(status);
  }

  async obtenerPorCarrera(codPrograma: string, filters?: StudentFilters, filename?: string): Promise<RetencionResponseDto[]> {
    // Combinamos el cod_programa con los filtros existentes
    const finalFilters: StudentFilters = { ...filters, cod_programa: codPrograma };

    // Delegamos la obtención de datos al orquestador
    const status = await this.studentService.findAll(finalFilters, filename);

    return this.calcularRetencion(status, codPrograma);
  }

  // --- Lógica Pura de Negocio (Cálculos) ---

  private agruparCarreras(status: StudentAcademicStatus[]): CarreraResponseDto[] {
    const carrerasMap = new Map<string, { count: number, nombre: string }>();

    for (const s of status) {
      const cod = s.cod_programa;
      const current = carrerasMap.get(cod);

      if (current) {
        current.count++;
      } else {
        carrerasMap.set(cod, {
          count: 1,
          nombre: s.nombre_estandar || ''
        });
      }
    }

    return Array.from(carrerasMap.entries()).map(([key, value]) => ({
      cod_programa: key,
      nombre_estandar: value.nombre,
      count: value.count
    }));
  }
  private calcularRetencion(status: StudentAcademicStatus[], forceCodPrograma?: string): RetencionResponseDto[] {
    const secondYearSet = new Set<string>();

    // 1. Indexar matriculados
    for (const s of status) {
      if (this.isMatriculado(s)) {
        // Aseguramos que el año sea parte de la clave tal cual viene
        secondYearSet.add(`${s.rut}|${s.cod_programa}|${s.catalogo}|${s.year_estado}`);
      }
    }

    const byYear = new Map<number, { m1: number; r1: number; carrera: string }>();

    for (const s of status) {
      if (!this.isMatriculado(s)) continue;
      // Usamos '==' para permitir comparación entre string "2011" y number 2011 por si acaso, 
      // o convertimos ambos. Lo ideal es asegurar conversión.
      if (s.year_estado != s.year_admision) continue;

      // CORRECCIÓN AQUÍ: Forzamos la conversión a Número con Number() o el símbolo +
      const Y = Number(s.year_admision);

      // Ahora Y + 1 será 2012 (matemático) en vez de "20111" (texto)
      const k2 = `${s.rut}|${s.cod_programa}|${s.catalogo}|${Y + 1}`;

      const entry = byYear.get(Y) || { m1: 0, r1: 0, carrera: s.cod_programa };

      entry.m1 += 1;
      if (secondYearSet.has(k2)) {
        entry.r1 += 1;
      }

      if (!forceCodPrograma) entry.carrera = 'global';

      byYear.set(Y, entry);
    }

    return Array.from(byYear.entries()).map(([anio, val]) => ({
      anio_cohorte: anio,
      carrera: forceCodPrograma || 'global',
      matriculados_primera_vez: val.m1,
      retenidos_anio_siguiente: val.r1,
      tasa_retencion: val.m1 ? +(val.r1 / val.m1).toFixed(4) : 0,
    })).sort((a, b) => a.anio_cohorte - b.anio_cohorte);
  }
}

   
