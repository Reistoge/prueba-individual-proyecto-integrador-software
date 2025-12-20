import { Injectable, Logger } from '@nestjs/common';
import { StudentService } from 'src/student/student.service';
import { StudentAcademicStatus } from 'src/student/entities/student-academic-status.schema';
import { CarreraResponseDto } from './dto/carrera-response.dto';
import { RetencionResponseDto } from './dto/retencion-response.dto';
import { StudentFilters } from 'src/student/repositories/student.repository.interface';

@Injectable()
export class RetencionService {

  constructor(
    private readonly studentService: StudentService
  ) { }
  private readonly logger = new Logger(RetencionService.name);

  private isMatriculado(s: StudentAcademicStatus) {
    return s.cod_estado === 'M';
  }

  // MODIFICADO: Acepta filename opcional
  async obtenerCarreras(filename?: string): Promise<CarreraResponseDto[]> {
    // Pasamos 'undefined' en filtros, pero sí pasamos el filename si existe
    const status = await this.studentService.findAll(undefined, filename);
    return this.agruparCarreras(status);
  }

  async obtenerResumen(filters?: StudentFilters, filename?: string): Promise<RetencionResponseDto[]> {
    const status = await this.studentService.findAll(filters, filename);
    return this.calcularRetencion(status);
  }

  async obtenerPorCarrera(codPrograma: string, filters?: StudentFilters, filename?: string): Promise<RetencionResponseDto[]> {
    const finalFilters: StudentFilters = { ...filters, cod_programa: codPrograma };
    const status = await this.studentService.findAll(finalFilters, filename);
    

    return this.calcularRetencion(status, codPrograma);
  }

  // --- Helpers de Negocio ---

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

    for (const s of status) {
      if (this.isMatriculado(s)) {
        secondYearSet.add(`${s.rut}|${s.cod_programa}|${s.catalogo}|${s.year_estado}`);
      }
    }

    const byYear = new Map<number, { m1: number; r1: number; carrera: string }>();

    for (const s of status) {
      if (!this.isMatriculado(s)) continue;
      // Convertimos a String explícitamente para evitar errores de comparación
      if (String(s.year_estado) !== String(s.year_admision)) continue;

      // Importante: Convertir a número para sumar 1 correctamente
      const Y = Number(s.year_admision);
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