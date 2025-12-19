import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StudentAcademicStatus } from './entities/student-academic-status.schema';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({summary: "Lee el archivo .json (como fuente de datos)."}) @ApiBody({type: CreateStudentDto, isArray:true}) @ApiResponse({ status: 201 })
  create(@Body() createStudentDto: CreateStudentDto[]) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  async findAll() : Promise<StudentAcademicStatus[]> {
    return await this.studentService.findAll();
  }

  @Get(':rut')
  async find(@Param('rut') rut: string) :Promise<StudentAcademicStatus[]>{
    return await this.studentService.findOne(rut);
  }

 
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.studentService.remove(+id);
  }
}
