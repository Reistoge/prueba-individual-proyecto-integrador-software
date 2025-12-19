import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentAcademicStatus, StudentAcademicStatusSchema } from 'src/student/entities/student-academic-status.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: StudentAcademicStatus.name, schema: StudentAcademicStatusSchema },
      // add more models here as you create them
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}