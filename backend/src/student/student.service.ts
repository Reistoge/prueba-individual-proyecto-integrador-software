import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAcademicStatus, StudentAcademicStatusDocument } from './entities/student-academic-status.schema';
import { Model, model } from 'mongoose';

@Injectable()
export class StudentService {
  constructor( @InjectModel(StudentAcademicStatus.name) private readonly model : Model<StudentAcademicStatusDocument>){}

  async create(createStudentDto: CreateStudentDto[]) {
    if (!Array.isArray(createStudentDto) || createStudentDto.length === 0) return;
    await this.model.insertMany(createStudentDto, { ordered: false });
  }


  async findAll() {
    return await this.model.find().lean<StudentAcademicStatus[]>(); 
  }

  async findOne(rut: string) : Promise<StudentAcademicStatus[]>{
    return await this.model.find({rut:rut}).lean<StudentAcademicStatus[]>()
  }

  async remove(rut: number) {
    return await this.model.deleteMany({rut: rut});
  }
}
