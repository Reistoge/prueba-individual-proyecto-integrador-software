import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
 
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
