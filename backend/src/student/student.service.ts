import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAcademicStatus, StudentAcademicStatusDocument } from './entities/student-academic-status.schema';
import { Model } from 'mongoose';
import * as path from 'path';
import { promises as fs } from 'fs';

// Imports de Repositorios
import { MongoStudentRepository } from './repositories/mongo-student.repository';
import { JsonStudentRepository } from './repositories/json-student.repository';
import { StudentFilters } from './repositories/student.repository.interface';

@Injectable()
export class StudentService {
  private seedDir = path.resolve(process.cwd(), 'src/database/seed');

  constructor(
    private readonly mongoRepo: MongoStudentRepository,
    private readonly jsonRepo: JsonStudentRepository,
    @InjectModel(StudentAcademicStatus.name) private readonly model: Model<StudentAcademicStatusDocument>
  ) { }

  // --- Método Orquestador (Facade) ---
  async findAll(filters?: StudentFilters, filename?: string): Promise<StudentAcademicStatus[]> {
    if (filename) {
      // Delegamos al repositorio JSON
      return this.jsonRepo.readAndFilter(filename, filters);
    } else {
      // Delegamos al repositorio Mongo
      return this.mongoRepo.findAll(filters);
    }
  }

  // --- Métodos de Escritura/Admin (Se mantienen igual) ---
  async create(createStudentDto: CreateStudentDto[]) {
    if (!Array.isArray(createStudentDto) || createStudentDto.length === 0) return;
    await this.model.insertMany(createStudentDto, { ordered: false });
  }
  async findOne(rut: string, filename?: string): Promise<StudentAcademicStatus[]> {
    if (filename) {
      // Estrategia Archivo JSON
      return this.jsonRepo.findByRut(filename, rut);
    } else {
      // Estrategia Base de Datos Mongo
      return this.mongoRepo.findByRut(rut);
    }
  }

  async remove(rut: string) {
    return await this.model.deleteMany({ rut }).exec();
  }

  async removeAll() {
    return await this.model.deleteMany({}).exec();
  }

  async seedFromFile(filename: string) {
    try {
      const filePath = path.join(this.seedDir, filename);
      const raw = await fs.readFile(filePath, 'utf-8');
      const data: CreateStudentDto[] = JSON.parse(raw);

      if (!Array.isArray(data)) throw new Error('Invalid file format');

      await this.create(data);
      return { success: true, loaded: data.length, file: filename };
    } catch (error) {
      throw new Error(`Failed to seed: ${error.message}`);
    }
  }

  async getFilenames() {
    const files = await fs.readdir(this.seedDir);
    return files.filter(f => f.endsWith('.json'));
  }
}