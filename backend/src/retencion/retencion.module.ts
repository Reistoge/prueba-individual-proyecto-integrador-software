import { Module } from '@nestjs/common';
import { RetencionService } from './retencion.service';
import { RetencionController } from './retencion.controller';
import { StudentService } from 'src/student/student.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
 
  controllers: [RetencionController],
  providers: [RetencionService, StudentService],
})
export class RetencionModule {}
