import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RetencionModule } from './retencion/retencion.module';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    DatabaseModule, 
    RetencionModule, StudentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
