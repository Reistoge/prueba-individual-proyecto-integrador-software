import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentAcademicStatus, StudentAcademicStatusDocument } from '../entities/student-academic-status.schema';
import { IStudentRepository, StudentFilters } from './student.repository.interface';

@Injectable()
export class MongoStudentRepository implements IStudentRepository {
  constructor(
    @InjectModel(StudentAcademicStatus.name) private readonly model: Model<StudentAcademicStatusDocument>
  ) { }

  async findAll(filters?: StudentFilters): Promise<StudentAcademicStatus[]> {
    const query = this.buildQuery(filters);
    return await this.model.find(query).lean<StudentAcademicStatus[]>();
  }
  async findByRut(rut: string): Promise<StudentAcademicStatus[]> {
    return this.model.find({ rut }).lean<StudentAcademicStatus[]>();
  }

  // Lógica extraída de RetencionService (versión funcional)
  private buildQuery(filters?: StudentFilters) {
    const query: any = {};

    if (filters?.cod_programa) {
      query.cod_programa = filters.cod_programa;
    }

    if (filters?.catalogo) {
      query.catalogo = filters.catalogo;
    }

    if (filters?.from || filters?.to) {
      query.year_admision = {};
      if (filters.from) query.year_admision.$gte = Number(filters.from);
      if (filters.to) query.year_admision.$lte = Number(filters.to);
    }

    return query;
  }
}