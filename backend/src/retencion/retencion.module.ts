import { Module } from '@nestjs/common';
import { RetencionService } from './retencion.service';
import { RetencionController } from './retencion.controller';
import { StudentService } from 'src/student/student.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongoStudentRepository } from 'src/student/repositories/mongo-student.repository';
import { JsonStudentRepository } from 'src/student/repositories/json-student.repository';

@Module({
 
  controllers: [RetencionController],
  providers: [RetencionService, StudentService,MongoStudentRepository, JsonStudentRepository],
})
export class RetencionModule {}
