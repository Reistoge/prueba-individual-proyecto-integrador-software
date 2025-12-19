// backend/src/retencion/retencion.service.ts
import { Injectable } from '@nestjs/common';
import { StudentService } from 'src/student/student.service';
import { StudentAcademicStatus } from 'src/student/entities/student-academic-status.schema';
import { CarreraResponseDto } from './dto/carrera-response.dto';
import { RetencionResponseDto } from './dto/retencion-response.dto';

// Definimos una interfaz simple para los filtros
interface RetentionFilters {
  from?: number;
  to?: number;
  catalogo?: string;
}

@Injectable()
export class RetencionService {

  constructor(
    private readonly studentService: StudentService
  ) { }

  private isMatriculado(s: StudentAcademicStatus) {
    // Aseguramos que nombre_estado exista antes de hacer toLowerCase
    return s.cod_estado === 'M';
  }

  // Helper para construir la query de MongoDB
  private buildQuery(filters?: RetentionFilters, codPrograma?: string) {
    const query: any = {};

    // Filtro por carrera si aplica
    if (codPrograma) {
      query.cod_programa = codPrograma;
    }

    // Filtro por Catálogo
    if (filters?.catalogo) {
      query.catalogo = filters.catalogo;
    }

    // Filtro por Rango de Años (Cohorte se basa en year_admision)
    if (filters?.from || filters?.to) {
      query.year_admision = {};
      if (filters.from) query.year_admision.$gte = Number(filters.from);
      if (filters.to) query.year_admision.$lte = Number(filters.to);
    }

    return query;
  }

  async obtenerCarreras(): Promise<CarreraResponseDto[]> {
    const status = await this.studentService.findAll();

    // Guardamos tanto el conteo como el nombre asociado al código
    const carrerasMap = new Map<string, { count: number, nombre: string }>();

    for (const s of status) {
      const cod = s.cod_programa;
      const current = carrerasMap.get(cod);

      if (current) {
        current.count++;
      } else {
        // Si es la primera vez que vemos este código, guardamos también su nombre
        carrerasMap.set(cod, {
          count: 1,
          nombre: s.nombre_estandar || '' // Fallback por si viene null
        });
      }
    }

    return Array.from(carrerasMap.entries()).map(([key, value]) => ({
      cod_programa: key,
      nombre_estandar: value.nombre, // <--- Aquí agregamos el campo faltante
      count: value.count
    }));
  }

  // Necesario porque si leemos el archivo JSON, no podemos usar queries de Mongo
  private filterInMemory(data: StudentAcademicStatus[], filters?: RetentionFilters, codPrograma?: string) {
    return data.filter(s => {
      // 1. Filtro Carrera
      if (codPrograma && s.cod_programa !== codPrograma) return false;

      // 2. Filtro Catálogo
      if (filters?.catalogo && s.catalogo !== filters.catalogo) return false;

      // 3. Filtro Rango de Años
      if (filters?.from && s.year_admision < Number(filters.from)) return false;
      if (filters?.to && s.year_admision > Number(filters.to)) return false;

      return true;
    });
  }
  async obtenerResumen(filters?: RetentionFilters, filename?: string): Promise<RetencionResponseDto[]> {
    let status: StudentAcademicStatus[];

    if (filename) {
      // Opción A: Leer desde archivo
      const rawData = await this.studentService.getDataFromFile(filename);
      // Aplicar filtros en memoria
      status = this.filterInMemory(rawData, filters);
    } else {
      // Opción B: Leer desde BD
      const query = this.buildQuery(filters);
      status = await this.studentService.findAll(query);
    }

    return this.calcularRetencion(status);
  }

  async obtenerPorCarrera(codPrograma: string, filters?: RetentionFilters, filename?: string): Promise<RetencionResponseDto[]> {
    let status: StudentAcademicStatus[];

    if (filename) {
      // Opción A: Leer desde archivo
      const rawData = await this.studentService.getDataFromFile(filename);
      // Aplicar filtros en memoria (incluyendo el código de programa)
      status = this.filterInMemory(rawData, filters, codPrograma);
    } else {
      // Opción B: Leer desde BD
      const query = this.buildQuery(filters, codPrograma);
      status = await this.studentService.findAll(query);
    }

    return this.calcularRetencion(status, codPrograma);
  }
  // Lógica de cálculo extraída para reutilización
  private calcularRetencion(status: StudentAcademicStatus[], forceCodPrograma?: string): RetencionResponseDto[] {
    const secondYearSet = new Set<string>();

    // Primera pasada: Identificar todos los matriculados para búsqueda rápida
    // Clave compuesta: RUT + Carrera + Catalogo + Año
    for (const s of status) {
      if (this.isMatriculado(s)) {
        secondYearSet.add(`${s.rut}|${s.cod_programa}|${s.catalogo}|${s.year_estado}`);
      }
    }

    const byYear = new Map<number, { m1: number; r1: number; carrera: string }>();

    for (const s of status) {
      // Regla 1: Matriculado
      if (!this.isMatriculado(s)) continue;
      // Regla 1: Primera matrícula (Admisión == Estado)
      if (s.year_estado !== s.year_admision) continue;

      const Y = s.year_admision;

      // Regla 2: Verificar si existe matrícula en Y + 1
      const k2 = `${s.rut}|${s.cod_programa}|${s.catalogo}|${Y + 1}`;

      const entry = byYear.get(Y) || { m1: 0, r1: 0, carrera: s.cod_programa };

      entry.m1 += 1;
      if (secondYearSet.has(k2)) {
        entry.r1 += 1;
      }
      // Si es resumen global, sobrescribimos carrera a 'global', si es por carrera se mantiene
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