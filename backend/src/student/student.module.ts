import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MongoStudentRepository } from './repositories/mongo-student.repository';
import { JsonStudentRepository } from './repositories/json-student.repository';

@Module({
  controllers: [StudentController],
  providers: [
    StudentService,
    MongoStudentRepository,  
    JsonStudentRepository    
  ],
  exports: [StudentService] 
})
export class StudentModule { }