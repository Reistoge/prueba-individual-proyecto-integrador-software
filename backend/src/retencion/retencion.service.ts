import { Inject, Injectable } from '@nestjs/common';
import { CreateRetencionDto } from './dto/create-retencion.dto';
import { UpdateRetencionDto } from './dto/update-retencion.dto';
import { StudentService } from 'src/student/student.service';
import { StudentAcademicStatus } from 'src/student/entities/student-academic-status.schema';
import { CarreraResponseDto } from './dto/carrera-response.dto';

@Injectable()
export class RetencionService {

  constructor(
    @Inject() private readonly studentService: StudentService

  ) { }

  obtenerPorCarrera(codPrograma: string) {
    throw new Error('Method not implemented.');
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
  async obtenerResumen() {
    const status: StudentAcademicStatus[] = await this.studentService.findAll();

    const years = Object.
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
      



  }


}
