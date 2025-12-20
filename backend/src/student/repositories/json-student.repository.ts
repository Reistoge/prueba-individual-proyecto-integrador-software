import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { StudentAcademicStatus } from '../entities/student-academic-status.schema';
import { StudentFilters } from './student.repository.interface';

@Injectable()
export class JsonStudentRepository {
  private seedDir = path.resolve(process.cwd(), 'src/database/seed');

  // Lógica extraída de StudentService y RetencionService
  async readAndFilter(filename: string, filters?: StudentFilters): Promise<StudentAcademicStatus[]> {
    const data = await this.getDataFromFile(filename);
    return this.filterInMemory(data, filters);
  }

  // Extraído de StudentService (funcional)
  private async getDataFromFile(filename: string): Promise<StudentAcademicStatus[]> {
    try {
      const filePath = path.join(this.seedDir, filename);
      await fs.access(filePath);
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);

      if (!Array.isArray(data)) throw new Error('El formato del archivo debe ser un array JSON');
      
      return data as StudentAcademicStatus[];
    } catch (error) {
      throw new NotFoundException(`Error al leer el archivo: ${error.message}`);
    }
  }

  // Extraído de RetencionService (funcional)
  private filterInMemory(data: StudentAcademicStatus[], filters?: StudentFilters): StudentAcademicStatus[] {
    if (!filters) return data;

    return data.filter(s => {
      if (filters.cod_programa && s.cod_programa !== filters.cod_programa) return false;
      if (filters.catalogo && s.catalogo !== filters.catalogo) return false;
      if (filters.from && s.year_admision < filters.from) return false;
      if (filters.to && s.year_admision > filters.to) return false;
      return true;
    });
  }
}