import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAcademicStatus, StudentAcademicStatusDocument } from './entities/student-academic-status.schema';
import { Model, model } from 'mongoose';
import path from 'path';
import { promises as fs } from 'fs';

const seedDir = path.resolve(process.cwd(), 'src/database/seed');

@Injectable()
export class StudentService {


  constructor(
    @InjectModel(StudentAcademicStatus.name) private readonly model: Model<StudentAcademicStatusDocument>

  ) { }

  async create(createStudentDto: CreateStudentDto[]) {
    if (!Array.isArray(createStudentDto) || createStudentDto.length === 0) return;
    await this.model.insertMany(createStudentDto, { ordered: false });
  }


  async findAll() {
    return await this.model.find().lean<StudentAcademicStatus[]>();
  }

  async findOne(rut: string): Promise<StudentAcademicStatus[]> {
    return await this.model.find({ rut: rut }).lean<StudentAcademicStatus[]>()
  }

  async remove(rut: string) {
    return await this.model.deleteMany({ rut }).exec();
  }
  async removeAll() {
    return await this.model.deleteMany({}).exec();
  }

  async seedFromFile(filename: string) {
    try {
      const filePath = path.join(seedDir, filename);
      const raw = await fs.readFile(filePath, 'utf-8');
      const data: CreateStudentDto[] = JSON.parse(raw);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid file format: expected an array');
      }
      
      await this.create(data);
      return { success: true, loaded: data.length, file: filename };
    } catch (error) {
      throw new Error(`Failed to seed from file: ${error.message}`);
    }
  }

  async getFilenames() {
    const files = await fs.readdir(seedDir);
    return files.filter(f => f.endsWith('.json'));
  }
}
