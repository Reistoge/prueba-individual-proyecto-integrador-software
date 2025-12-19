import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { StudentService } from '../../student/student.service';
import { CreateStudentDto } from '../../student/dto/create-student.dto';
import { promises as fs } from 'fs';
import * as path from 'path';

async function seedFromJson(filename: string) {
  console.log(`Loading data from ${filename}...`);
  
  const filePath = path.resolve(__dirname, filename);
  
  // Read JSON file
  let data: CreateStudentDto[];
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error('JSON file must contain an array of student records.');
    process.exit(1);
  }

  console.log(`Found ${data.length} records to insert.`);

  // Create app context and get StudentService
  const app = await NestFactory.createApplicationContext(AppModule);
  const studentService = app.get(StudentService);

  // Insert data
  await studentService.create(data);

  console.log(`✓ Successfully inserted ${data.length} records into the database.`);

  await app.close();
}

// CLI: ts-node src/database/seed/seed.ts <filename.json>
(async () => {
  try {
    const filename = process.argv[2];
    
    if (!filename) {
      console.error('Usage: ts-node src/database/seed/seed.ts <filename.json>');
      console.error('Example: ts-node src/database/seed/seed.ts student-status.seed.20.80.json');
      process.exit(1);
    }

    await seedFromJson(filename);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();