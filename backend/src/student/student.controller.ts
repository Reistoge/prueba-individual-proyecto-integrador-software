import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StudentAcademicStatus } from './entities/student-academic-status.schema';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Post()
  @ApiOperation({ summary: "Ingresa un JSON como body para utilizarlo como fuente de datos." }) @ApiBody({ type: CreateStudentDto, isArray: true }) @ApiResponse({ status: 201 })
  create(@Body() createStudentDto: CreateStudentDto[]) {
    return this.studentService.create(createStudentDto);
  }
  @Post('seed/:filename')
  @ApiOperation({ summary: "Hace un seed de la base de datos acorde a los archivos dentro de la carpeta database/seed" })
  async seedFromFile(@Param('filename') filename: string) {
    return await this.studentService.seedFromFile(filename);
  }
  @Get('filenames')
  @ApiOperation({ summary: "Obtiene los nombres de los archivos disponibles." })
  async getFilenames() {
    return await this.studentService.getFilenames();
  }

  @Get(':rut')
  @ApiOperation({ summary: "Busca registros de un estudiante por RUT. Si se indica 'filename', busca en ese archivo." })
  @ApiQuery({ name: 'filename', required: false, description: 'Nombre del archivo (ej: output.json)' })
  async find(
    @Param('rut') rut: string,
    @Query('filename') filename?: string // <--- Nuevo parámetro opcional
  ): Promise<StudentAcademicStatus[]> {
    return await this.studentService.findOne(rut, filename);
  }
  @Get() @ApiOperation({ summary: "Obtiene todos los registros." })
  async findAll(): Promise<StudentAcademicStatus[]> {
    return await this.studentService.findAll();
  }


  @Delete('all')
  @ApiOperation({ summary: "Elimina todos los registros de la base de datos" })
  async removeAll() {
    return await this.studentService.removeAll();
  }

  @Delete(':rut')
  async remove(@Param('rut') rut: string) {
    return await this.studentService.remove(rut);
  }








}
