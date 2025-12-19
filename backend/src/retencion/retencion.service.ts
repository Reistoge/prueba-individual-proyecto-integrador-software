import { Inject, Injectable } from '@nestjs/common';
import { CreateRetencionDto } from './dto/create-retencion.dto';
import { UpdateRetencionDto } from './dto/update-retencion.dto';
import { StudentService } from 'src/student/student.service';
import { StudentAcademicStatus } from 'src/student/entities/student-academic-status.schema';
import { CarreraResponseDto } from './dto/carrera-response.dto';
import { RetencionResponseDto } from './dto/retencion-response.dto';

@Injectable()
export class RetencionService {

  constructor(
     private readonly studentService: StudentService

  ) { }

  private isMatriculado(s: StudentAcademicStatus) {
    // const name = (s.nombre_estado || '').toLowerCase();
    return s.cod_estado === 'M';
  }
  
  async obtenerCarreras(): Promise<CarreraResponseDto[]> {

    const status: StudentAcademicStatus[] = await this.studentService.findAll();
    const carreras: CarreraResponseDto[] = Object.
      entries(
        status.reduce((acc, student) => {
          const key = student.cod_programa;
          if (!acc[key]) {
            acc[key] = { cod_programa: key, count: 0 };
          }
          acc[key].count++;
          return acc;
        }, {})
      ).map(([key, value]) => value as CarreraResponseDto)

    return carreras;

  }
  async obtenerResumen(): Promise<RetencionResponseDto[]> {
    const status = await this.studentService.findAll();
    const secondYearSet = new Set<string>();
    for (const s of status) {
      if (this.isMatriculado(s)) {
        secondYearSet.add(`${s.rut}|${s.cod_programa}|${s.catalogo}|${s.year_estado}`);
      }
    }
    const byYear = new Map<number, { m1: number; r1: number }>();
    for (const s of status) {
      if (!this.isMatriculado(s)) continue;
      if (s.year_estado !== s.year_admision) continue;
      const Y = s.year_admision;
      const k2 = `${s.rut}|${s.cod_programa}|${s.catalogo}|${Y + 1}`;
      const entry = byYear.get(Y) || { m1: 0, r1: 0 };
      entry.m1 += 1;
      if (secondYearSet.has(k2)) entry.r1 += 1;
      byYear.set(Y, entry);
    }
    return Array.from(byYear.entries()).map(([anio, { m1, r1 }]) => ({
      anio_cohorte: anio,
      carrera: 'global',
      matriculados_primera_vez: m1,
      retenidos_anio_siguiente: r1,
      tasa_retencion: m1 ? +(r1 / m1).toFixed(4) : 0,
    }));
  }

  async obtenerPorCarrera(codPrograma: string): Promise<RetencionResponseDto[]> {
    const status = (await this.studentService.findAll()).filter(s => s.cod_programa === codPrograma);
    const secondYearSet = new Set<string>();
    for (const s of status) {
      if (this.isMatriculado(s)) {
        secondYearSet.add(`${s.rut}|${s.cod_programa}|${s.catalogo}|${s.year_estado}`);
      }
    }
    const byYear = new Map<number, { m1: number; r1: number }>();
    for (const s of status) {
      if (!this.isMatriculado(s)) continue;
      if (s.year_estado !== s.year_admision) continue;
      const Y = s.year_admision;
      const k2 = `${s.rut}|${s.cod_programa}|${s.catalogo}|${Y + 1}`;
      const entry = byYear.get(Y) || { m1: 0, r1: 0 };
      entry.m1 += 1;
      if (secondYearSet.has(k2)) entry.r1 += 1;
      byYear.set(Y, entry);
    }
    return Array.from(byYear.entries()).map(([anio, { m1, r1 }]) => ({
      anio_cohorte: anio,
      carrera: codPrograma,
      matriculados_primera_vez: m1,
      retenidos_anio_siguiente: r1,
      tasa_retencion: m1 ? +(r1 / m1).toFixed(4) : 0,
    }));
  }
}
