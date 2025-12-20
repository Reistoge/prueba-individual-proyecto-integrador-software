import { StudentAcademicStatus } from "../entities/student-academic-status.schema";

export interface StudentFilters {
  cod_programa?: string;
  catalogo?: string;
  from?: number;
  to?: number;
}

export interface IStudentRepository {
  findAll(filters?: StudentFilters): Promise<StudentAcademicStatus[]>;
}